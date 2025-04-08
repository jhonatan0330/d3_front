import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';

import { NewPasswordComponent } from './new-password.component';
import { newPasswordRoutes } from './new-password.routing';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
    declarations: [
        NewPasswordComponent
    ],
    imports     : [
        RouterModule.forChild(newPasswordRoutes),
        SharedModule,
        MatProgressBarModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule
    ]
})
export class NewPasswordModule
{
}
