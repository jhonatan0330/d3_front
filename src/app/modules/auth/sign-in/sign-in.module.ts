import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FuseCardModule } from '@fuse/components/card';
import { FuseAlertModule } from '@fuse/components/alert';
import { SharedModule } from 'app/shared/shared.module';
import { AuthSignInComponent } from 'app/modules/auth/sign-in/sign-in.component';
import { authSignInRoutes } from 'app/modules/auth/sign-in/sign-in.routing';
import { SharedMaterialModule } from 'app/shared/shared-material.module';

@NgModule({
    declarations: [
        AuthSignInComponent
    ],
    imports     : [
        RouterModule.forChild(authSignInRoutes),
        /*MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,*/
        SharedMaterialModule,
        FuseCardModule,
        FuseAlertModule,
        SharedModule
    ]
})
export class AuthSignInModule
{
}
