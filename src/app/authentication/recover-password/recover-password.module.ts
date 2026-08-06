import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';

import { RecoverPasswordComponent } from './recover-password.component';
import { recoverPasswordRoutes } from './recover-password.routing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
    imports: [
        RouterModule.forChild(recoverPasswordRoutes),
        SharedModule,
        MatProgressBarModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        RecoverPasswordComponent
    ]
})
export class RecoverPasswordModule
{
}
