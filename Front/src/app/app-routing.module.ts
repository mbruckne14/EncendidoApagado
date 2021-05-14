import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from './_helpers';

const accountModule = () => import('./account/account.module').then(x => x.AccountModule);
const resourcesModule = () => import('./resources/resources.module').then(x => x.ResourcesModule);
const schedulerModule = () => import('./scheduler/scheduler.module').then(x => x.SchedulerModule);

const routes: Routes = [
    { path: 'resources', loadChildren: resourcesModule, canActivate: [AuthGuard] },
    { path: 'account', loadChildren: accountModule },
    { path: 'scheduler', loadChildren: schedulerModule, canActivate: [AuthGuard] },
    // otherwise redirect to home
    { path: '**', redirectTo: '', canActivate: [AuthGuard] }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }