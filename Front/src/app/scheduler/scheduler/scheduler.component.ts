import { Component, AfterViewInit, ElementRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormArray, FormGroup, FormControl } from '@angular/forms';
import { AccountService, AlertService } from '@app/_services';
import { DialogComponent } from '@app/_components/dialog/dialog.component';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { SpinnerOverlayComponent } from '@app/_components/spinner/spinner-overlay.component';



@Component({
  selector: 'resources-scheduler',
  templateUrl: './scheduler.component.html',
  styleUrls: ['./scheduler.component.less']
})
export class SchedulerComponent implements AfterViewInit {
  form: FormGroup;
  timeEncendido = { hour: 0, minute: 0 };
  timeApagado = { hour: 0, minute: 0 };
  diasEncendido: any = [
    { id: 2, name: 'Lunes', checked: false },
    { id: 3, name: 'Martes', checked: false },
    { id: 4, name: 'Miercoles', checked: false },
    { id: 5, name: 'Jueves', checked: false },
    { id: 6, name: 'Viernes', checked: false },
    { id: 7, name: 'Sabado', checked: false },
    { id: 1, name: 'Domingo', checked: false }];
  diasApagado: any = [
    { id: 2, name: 'Lunes', checked: false },
    { id: 3, name: 'Martes', checked: false },
    { id: 4, name: 'Miercoles', checked: false },
    { id: 5, name: 'Jueves', checked: false },
    { id: 6, name: 'Viernes', checked: false },
    { id: 7, name: 'Sabado', checked: false },
    { id: 1, name: 'Domingo', checked: false }];
  loadingHabilitar = false;
  loadingDeshabilitar = false;
  estadoEncendido : string;
  estadoApagado : string;
  loading = false;
  mensaje: string;
  target: string;
  overlayRef: OverlayRef = null;

  constructor(public dialog: MatDialog, private formBuilder: FormBuilder, private accountService: AccountService,
    private alertService: AlertService, private overlay: Overlay) {
    this.form = this.formBuilder.group({
      diasEncendido: this.formBuilder.array([]),
      diasApagado: this.formBuilder.array([])
    });

  }
  onCheckboxChange(e, nombreArray) {
    var arrayForm: FormArray;

    if (nombreArray == 'encendido') {
      arrayForm = this.form.get('diasEncendido') as FormArray;
    }
    else {
      arrayForm = this.form.get('diasApagado') as FormArray;
    }
    if (e.checked) {
      arrayForm.push(new FormControl(e.source.value));
    } else {
      const index = arrayForm.controls.findIndex(x => x.value === e.source.value);
      arrayForm.removeAt(index);
    }
  }

  ngAfterViewInit(): void {
    this.show();
    this.accountService.getSchedule()
      .subscribe(
        data => {
          if (data.respuesta.message !== false) {
            this.CargarDatos(data);
          }
          this.hide();
        },
        error => {
          this.alertService.error(error.message);
          this.hide();
        });
  }

  openDialog(event): void {
    this.target = event.target.id;
    this.mensaje = "Está seguro que quiere <strong>" + event.target.id + " </strong> el programado de recursos?";
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '300px',
      data: { mensaje: this.mensaje },
      position: {
        top: '12%'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.HabilitaroDeshabilitarProgramado();
      }
    });
  }

  CargarDatos(data): void {

    var arrayForm: FormArray;
    arrayForm = this.form.get('diasEncendido') as FormArray;
    for (var dia of data.respuesta.diasEncendido) {
      arrayForm.push(new FormControl(parseInt(dia)));
      var index = this.diasEncendido.findIndex(x => x.id == dia);
      this.diasEncendido[index].checked = true;

    }
    arrayForm = this.form.get('diasApagado') as FormArray;
    for (var dia of data.respuesta.diasApagado) {
      arrayForm.push(new FormControl(parseInt(dia)));
      var index = this.diasApagado.findIndex(x => x.id == dia);
      this.diasApagado[index].checked = true;

    }
    this.timeEncendido = { hour: parseInt(data.respuesta.timeEncendido.hour), minute: parseInt(data.respuesta.timeEncendido.minute) };
    this.timeApagado = { hour: parseInt(data.respuesta.timeApagado.hour), minute: parseInt(data.respuesta.timeApagado.minute) };
    this.estadoEncendido = data.respuesta.statusEncendido;
    this.estadoApagado = data.respuesta.statusApagado;
  }

  HabilitaroDeshabilitarProgramado() {
    // reset alerts on submit
    this.alertService.clear();
    this.show();
    this.loading = true;
    this.loadingHabilitar = this.target == "habilitar" ? true : false;
    this.loadingDeshabilitar = this.target == "deshabilitar" ? true : false;
    /*  if (this.form.value.diasEncendido.length !== 0 && this.form.value.diasApagado.length !== 0) { */
    if (this.timeEncendido !== null && this.timeApagado !== null) {
      this.accountService.scheduleResources(this.timeEncendido, this.timeApagado, this.form.value.diasEncendido, this.form.value.diasApagado, this.target)
        .subscribe(
          data => {
            this.alertService.success(data.message);
            this.estadoEncendido = data.statusEncendido;
            this.estadoApagado = data.statusApagado;
            this.loading = false;
            this.loadingHabilitar = false;
            this.loadingDeshabilitar = false;
            this.hide();
          },
          error => {
            this.alertService.error(error.message);
            this.loading = false;
            this.loadingHabilitar = false;
            this.loadingDeshabilitar = false;
            this.hide();
          });
    }
    else {
      this.alertService.error("Debe ingresar un horario válido de encendido y de apagado");
      this.loading = false;
      this.loadingHabilitar = false;
      this.loadingDeshabilitar = false;
      this.hide();
      return;
    }
    /* }
    else {
      this.alertService.error("Debe seleccionar al menos un día para el encendido y para el apagado");
      this.loading = false;
      this.loadingHabilitar = false;
      this.loadingDeshabilitar = false;
      this.hide();
      return;
    } */
  }

  public show(message = '') {
    // Returns an OverlayRef (which is a PortalHost)

    if (!this.overlayRef) {
      this.overlayRef = this.overlay.create();
    }

    // Create ComponentPortal that can be attached to a PortalHost
    const spinnerOverlayPortal = new ComponentPortal(SpinnerOverlayComponent);
    this.overlayRef.attach(spinnerOverlayPortal); // Attach ComponentPortal to PortalHost
  }

  public hide() {
    if (!!this.overlayRef) {
      this.overlayRef.detach();
    }
  }
}
