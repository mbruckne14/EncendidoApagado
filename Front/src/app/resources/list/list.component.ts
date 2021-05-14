import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AccountService, AlertService } from '@app/_services';
import { DialogComponent } from '@app/_components/dialog/dialog.component';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { SpinnerOverlayComponent } from '@app/_components/spinner/spinner-overlay.component';


@Component({
    selector: 'list-resources',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.css']
})

export class ListComponent implements OnInit {
    loadingEncender = false;
    loadingApagar = false;
    loading = false;
    submitted = false;
    tagName: string;
    tagValue: string;
    mensaje: string;
    target: string;
    overlayRef: OverlayRef = null;


    constructor(public dialog: MatDialog, private accountService: AccountService, private alertService: AlertService, private overlay: Overlay) {
    }

    openDialog(event): void {
        this.target = event.target.id;
        if (!this.tagName && !this.tagValue) {
            this.mensaje = "Está seguro que quiere <strong>" + event.target.id + " todos</strong> los recursos?";
        }
        else {
            this.mensaje = "Está seguro que quiere <strong>" + event.target.id + "</strong> los recursos con el Tag Name: <strong>" + this.tagName + "</strong> y el Tag Value: <strong>" + this.tagValue + "</strong>?";
        }


        const dialogRef = this.dialog.open(DialogComponent, {
            width: '300px',
            data: { mensaje: this.mensaje },
            position: {
                top: '12%'
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                if (this.target == "encender") {
                    this.EncenderRecursos();
                }
                else {
                    this.ApagarRecursos();
                }

            }
        });
    }

    ngOnInit() {
        /* this.accountService.getAll()
            .pipe(first())
            .subscribe(users => this.users = users); */
    }

    EncenderRecursos() {
        // reset alerts on submit
        this.alertService.clear();
        this.show();
        this.loading = true;
        this.loadingEncender = true;
        this.accountService.startResources(this.tagName, this.tagValue)
            .subscribe(
                data => {
                    this.alertService.success("Resources have been started");
                    this.loading = false;
                    this.loadingEncender = false;
                    this.hide();
                },
                error => {
                    this.alertService.error("An error has occured");
                    this.loading = false;
                    this.loadingEncender = false;
                    this.hide();
                });

    }

    ApagarRecursos = function () {

        // reset alerts on submit
        this.alertService.clear();
        this.show();
        this.loading = true;
        this.loadingApagar = true;
        this.accountService.stopResources(this.tagName, this.tagValue)
            .subscribe(
                data => {
                    this.alertService.success("Resources have been stopped");
                    this.loading = false;
                    this.loadingApagar = false;
                    this.hide();

                },
                error => {
                    this.alertService.error(error);
                    this.loading = false;
                    this.loadingApagar = false;
                    this.hide();
                });
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


