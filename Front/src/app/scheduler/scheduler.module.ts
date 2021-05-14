import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { OverlayModule } from '@angular/cdk/overlay';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SchedulerRoutingModule } from './scheduler-routing.module';
import { LayoutComponent } from './layout/layout.component';
import { SchedulerComponent } from './scheduler/scheduler.component';


@NgModule({

  imports: [
    CommonModule,
    ReactiveFormsModule,
    SchedulerRoutingModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    NgbModule,
    OverlayModule
  ],
  declarations: [
    LayoutComponent,
    SchedulerComponent
  ]

})
export class SchedulerModule { }
