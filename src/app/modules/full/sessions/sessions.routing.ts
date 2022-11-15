
import { Routes } from '@angular/router';

import { SigninComponent } from './signin/signin.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { ErrorComponent } from './error/error.component';
import { RecoverPasswordComponent } from './recover-password/recover-password.component';
import { NewPasswordComponent } from './new-password/new-password.component';

export const SessionsRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'signin',
        component: SigninComponent,
        data: { title: 'Signin' }
      },
      {
        path: 'recover',
        component: RecoverPasswordComponent,
        data: { title: 'Signin' }
      },
      {
        path: 'new/:id',
        component: NewPasswordComponent,
      },
      {
        path: '404',
        component: NotFoundComponent,
        data: { title: 'Not Found' }
      },
      {
        path: 'error',
        component: ErrorComponent,
        data: { title: 'Error' }
      }
    ]
  }
];
