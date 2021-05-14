import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { ResourcesRoutingModule } from './resources-routing.module';
import { LayoutComponent } from './layout/layout.component';
import { ListComponent } from './list/list.component';
import { DialogComponent } from '@app/_components/dialog/dialog.component';


@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ResourcesRoutingModule,
        FormsModule,
        MatButtonModule,
        MatInputModule,
        MatIconModule,
        MatDialogModule
    ],
    declarations: [
        LayoutComponent,
        ListComponent,
        DialogComponent

    ]
})
export class ResourcesModule { }