import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedMaterialModule } from 'app/shared/shared-material.module';
import { SharedModule } from 'app/shared/shared.module';

import { NewPasswordComponent } from './new-password.component';
import { newPasswordRoutes } from './new-password.routing';

@NgModule({
    declarations: [
        NewPasswordComponent
    ],
    imports     : [
        RouterModule.forChild(newPasswordRoutes),
        SharedMaterialModule,
        SharedModule
    ]
})
export class NewPasswordModule
{
}
