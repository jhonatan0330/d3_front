import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FuseCardModule } from '@fuse/components/card';
import { FuseAlertModule } from '@fuse/components/alert';
import { SharedModule } from 'app/shared/shared.module';
import { authSignInRoutes } from './sign-in.routing';
import { AuthSignInComponent } from './sign-in.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
    declarations: [
        AuthSignInComponent
    ],
    imports     : [
        RouterModule.forChild(authSignInRoutes),
        FuseCardModule,
        FuseAlertModule,
        MatProgressBarModule,
        MatCardModule,
        MatFormFieldModule,
        SharedModule
    ]
})
export class AuthSignInModule
{
}
