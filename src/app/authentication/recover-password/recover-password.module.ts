import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';

import { RecoverPasswordComponent } from './recover-password.component';
import { recoverPasswordRoutes } from './recover-password.routing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@NgModule({
    declarations: [
        RecoverPasswordComponent
    ],
    imports     : [
        RouterModule.forChild(recoverPasswordRoutes),
        SharedModule,
        MatFormFieldModule,
        MatCardModule,
        MatProgressBarModule
    ]
})
export class RecoverPasswordModule
{
}
