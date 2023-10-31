import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';

import { NewPasswordComponent } from './new-password.component';
import { newPasswordRoutes } from './new-password.routing';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
    declarations: [
        NewPasswordComponent
    ],
    imports     : [
        RouterModule.forChild(newPasswordRoutes),
        SharedModule,
        MatProgressBarModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatCheckboxModule
    ]
})
export class NewPasswordModule
{
}
