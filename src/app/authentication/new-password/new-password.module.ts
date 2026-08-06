import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';


import { NewPasswordComponent } from './new-password.component';
import { newPasswordRoutes } from './new-password.routing';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
    imports: [
    RouterModule.forChild(newPasswordRoutes),
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    NewPasswordComponent
]
})
export class NewPasswordModule
{
}
