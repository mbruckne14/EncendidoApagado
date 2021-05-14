import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService, AlertService } from '@app/_services';
import { first } from 'rxjs/operators';

export interface DialogData {
    username: string;
}

@Component({
    templateUrl: 'changePassword.dialog.html',
    styleUrls: ['changePassword.dialog.css']
})
export class DialogComponent implements OnInit {

    form: FormGroup;
    loading = false;
    submitted = false;
    returnUrl: string;

    constructor(
        private formBuilder: FormBuilder,
        private accountService: AccountService,
        private alertService: AlertService,
        public dialogRef: MatDialogRef<DialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

    ngOnInit() {
        this.form = this.formBuilder.group({
            passwordActual: ['', Validators.required],
            passwordNuevo: ['', Validators.required],
            passwordConfirmar: ['', Validators.required]
        }, { validator: this.SamePasswordValidator });

    }

    get f() { return this.form.controls; }

    SamePasswordValidator: ValidatorFn = (fg: FormGroup) => {
        const passwordNuevo = fg.get('passwordNuevo').value;
        const passwordConfirmar = fg.get('passwordConfirmar').value;
        return passwordNuevo === passwordConfirmar
            ? null
            : { notMatching: true };
    };

    onSubmit() {
        this.submitted = true;
        // reset alerts on submit
        this.alertService.clear();

        // stop here if form is invalid

        if (this.form.invalid) {
            return;
        }

        this.loading = true;
        this.accountService.changePassword(this.data.username, this.f.passwordActual.value, this.f.passwordNuevo.value)
            .pipe(first())
            .subscribe(
                data => {
                    this.alertService.success(data.mensaje);
                    this.dialogRef.close(true);
                },
                error => {
                    this.alertService.error(error);
                    this.dialogRef.close(false);
                });
    }
}