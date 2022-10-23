import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedMaterialModule } from 'app/shared/shared-material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SessionsRoutes } from '../sessions/sessions.routing'

import { SigninComponent } from './signin/signin.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { ErrorComponent } from './error/error.component';
import { ChangePwdComponent } from './change-pwd/change-pwd.component';
import { ChangePictureComponent } from './change-picture/change-picture.component';
import { SharedPipesModule } from 'app/shared/pipes/shared-pipes.module';
import { RecoverPasswordComponent } from './recover-password/recover-password.component';
import { NewPasswordComponent } from './new-password/new-password.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedMaterialModule,
    SharedPipesModule,
    FlexLayoutModule,
    RouterModule.forChild(SessionsRoutes)
  ],
  declarations: [
    SigninComponent,
    RecoverPasswordComponent,
    NewPasswordComponent,
    NotFoundComponent,
    ErrorComponent,
    ChangePwdComponent,
    ChangePictureComponent
  ]
})
export class SessionsModule { }
