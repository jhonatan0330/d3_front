import { Route } from '@angular/router';
import { LayoutComponent } from 'app/layout/layout.component';
import { AuthGuard } from './authentication/authentication.guard';

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [

  // Redirect empty path to '/main'
  { path: '', pathMatch: 'full', redirectTo: '/main' },
  { path: 'signed-in-redirect', pathMatch: 'full', redirectTo: '/main' },

  // Auth routes for guests
  {
    path: '',
    component: LayoutComponent,
    data: {
      layout: 'empty'
    },
    children: [
      { path: 'confirmation-required', loadChildren: () => import('app/authentication/confirmation-required/confirmation-required.module').then(m => m.AuthConfirmationRequiredModule) },
      { path: 'sessions/recover', loadChildren: () => import('app/authentication/recover-password/recover-password.module').then(m => m.RecoverPasswordModule) },
      { path: 'sessions/new/:id', loadChildren: () => import('app/authentication/new-password/new-password.module').then(m => m.NewPasswordModule) },
      { path: 'sign-in', loadChildren: () => import('app/authentication/sign-in/sign-in.module').then(m => m.AuthSignInModule) },
      { path: '404', pathMatch: 'full', loadChildren: () => import('app/layout/common/error-404/error-404.module').then(m => m.Error404Module) },
      { path: 'error', pathMatch: 'full', loadChildren: () => import('app/layout/common/error-500/error-500.module').then(m => m.Error500Module) },
      { path: 'sign-out', loadChildren: () => import('app/authentication/sign-out/sign-out.module').then(m => m.AuthSignOutModule) },
    ]
  },
  // Admin routes
  {
    path: '',
    canActivate: [AuthGuard],
    component: LayoutComponent,
    children: [
      { path: '', loadChildren: () => import('app/authorization/authorization.module').then(m => m.ProfileModule) },
      { path: 'settings', loadChildren: () => import('app/authentication/settings/settings.module').then(m => m.SettingsModule) },
      { path: 'list', loadChildren: () => import('app/cruds/cruds.module').then(m => m.CrudsModule) },
      { path: 'maps', loadChildren: () => import('app/gps/gps.module').then(m => m.GPSModule) },
      { path: 'tasks', loadChildren: () => import('app/tasks/tasks.module').then(m => m.TasksModule) },
      { path: 'designer', loadChildren: () => import('app/process-designer/process-designer.module').then(m => m.ProcessDesignerModule) },
      { path: 'academy', loadChildren: () => import('app/academy/academy.module').then(m => m.AcademyModule) },
      { path: 'UIVotacion', loadChildren: () => import('app/survey/survey.module').then(m => m.SurveyModule) },
      { path: 'noseperolodejopormodule', loadChildren: () => import('app/modules/full/neuron/neuron.module').then(m => m.NeuronModule) },
      { path: 'trace-doc', loadChildren: () => import('app/document-transition/document-transition.module').then(m => m.DocumentTransitionModule) },
      { path: 'massive', loadChildren: () => import('app/massive/massive.module').then(m => m.MassiveModule) },
      { path: 'inventory', loadChildren: () => import('app/inventory/inventory.module').then(m => m.InventoryModule) },
      { path: 'account', loadChildren: () => import('app/accounting/accounting.module').then(m => m.AccountingModule) },
      { path: 'tariff', loadChildren: () => import('app/tariff/tariff.module').then(m => m.TariffModule) },
      { path: 'help', loadChildren: () => import('app/help-center/help-center.routes')},
      { path: '404-not-found', pathMatch: 'full', loadChildren: () => import('app/layout/common/error-404/error-404.module').then(m => m.Error404Module) },
      { path: '**', redirectTo: '404-not-found' }
    ]


  }
];
