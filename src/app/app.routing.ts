import { Route } from '@angular/router';
import { LayoutComponent } from 'app/layout/layout.component';
import { AuthGuard } from './authentication/authentication.guard';

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [

  { path: '', pathMatch: 'full', redirectTo: '/main' },

  // Auth routes for guests
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', loadChildren: () => import('app/authorization/authorization.module').then(m => m.ProfileModule) },
      { path: 'sessions/recover', loadChildren: () => import('app/authentication/recover-password/recover-password.module').then(m => m.RecoverPasswordModule) },
      { path: 'sessions/new/:id', loadChildren: () => import('app/authentication/new-password/new-password.module').then(m => m.NewPasswordModule) }
    ]
  },
   // Admin routes
   {
    path: '',
    canActivate: [AuthGuard],
    component: LayoutComponent,
    children: [
      
      { path: 'settings', loadChildren: () => import('app/authentication/settings/settings.module').then(m => m.SettingsModule) },
      { path: 'list', loadChildren: () => import('app/cruds/cruds.module').then(m => m.CrudsModule) },
      { path: 'maps', loadChildren: () => import('app/gps/gps.module').then(m => m.GPSModule) },
      { path: 'tasks', loadChildren: () => import('app/tasks/tasks.module').then(m => m.TasksModule) },
      { path: 'noseperolodejopormodule', loadChildren: () => import('app/modules/full/neuron/neuron.module').then(m => m.NeuronModule) },
      { path: 'massive', loadChildren: () => import('app/massive/massive.module').then(m => m.MassiveModule) },
      { path: 'account', loadChildren: () => import('app/accounting/accounting.module').then(m => m.AccountingModule) },
      { path: '**', redirectTo: 'main' }
    ]


  }
];
