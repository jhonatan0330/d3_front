import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';

import { RecoverPasswordComponent } from './recover-password.component';
import { recoverPasswordRoutes } from './recover-password.routing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
    declarations: [
        RecoverPasswordComponent
    ],
    imports     : [
        RouterModule.forChild(recoverPasswordRoutes),
        SharedModule,
        MatProgressBarModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatCheckboxModule
    ]
})
export class RecoverPasswordModule
{
}
