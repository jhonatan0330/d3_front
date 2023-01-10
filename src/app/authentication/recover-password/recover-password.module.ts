import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedMaterialModule } from 'app/shared/shared-material.module';
import { SharedModule } from 'app/shared/shared.module';

import { RecoverPasswordComponent } from './recover-password.component';
import { recoverPasswordRoutes } from './recover-password.routing';

@NgModule({
    declarations: [
        RecoverPasswordComponent
    ],
    imports     : [
        RouterModule.forChild(recoverPasswordRoutes),
        SharedMaterialModule,
        SharedModule
    ]
})
export class RecoverPasswordModule
{
}
