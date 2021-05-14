import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
    mensaje: string;
}
@Component({
    templateUrl: 'resources.dialog.html'
})
export class DialogComponent {

    constructor(
        public dialogRef: MatDialogRef<DialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

    onSiClick(): void {
        this.dialogRef.close(true);
    }
    onNoClick(): void {
        this.dialogRef.close(false);
    }
}