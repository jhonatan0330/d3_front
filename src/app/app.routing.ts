import { Route } from '@angular/router';
import { LayoutComponent } from 'app/layout/layout.component';
import { AuthGuard } from './authentication/authentication.guard';
import { SignInSplitScreenReversedComponent } from './authentication/sign-in/split-screen-reversed/sign-in.component';
import { PersonsComponent } from './persons/persons.component';
import { CanDeactivateTasksDetails } from './tasks/tasks.guards';

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [

  { path: '', pathMatch: 'full', redirectTo: '/main' },

  // Auth routes for guests
  {
    path: '',
    component: LayoutComponent,
    data: {
      layout: 'empty'
    },
    children: [
      { path: 'sign-in', component: SignInSplitScreenReversedComponent},
      { path: 'sessions/recover', loadComponent: () => import('app/authentication/recover-password/recover-password.component').then(m => m.RecoverPasswordComponent) },
      { path: 'sessions/new/:id', loadComponent: () => import('app/authentication/new-password/new-password.component').then(m => m.NewPasswordComponent) },
    ]
  },
   // Admin routes
   {
    path: '',
    canActivate: [AuthGuard],
    component: LayoutComponent,
    children: [
      { path: 'main', loadComponent: () => import('app/authorization/profile/profile.component').then(m => m.ProfileComponent) },
      { path: 'main/:type', loadComponent: () => import('app/authorization/profile/profile.component').then(m => m.ProfileComponent) },
      { path: 'main/:type/:id', loadComponent: () => import('app/authorization/profile/profile.component').then(m => m.ProfileComponent) },
      { path: 'list/:type/:id', loadComponent: () => import('app/cruds/cruds2.component').then(m => m.Cruds2Component) },
      { path: 'list/:type/:id/:server_id', loadComponent: () => import('app/cruds/cruds2.component').then(m => m.Cruds2Component) },
      { path: 'tasks', redirectTo: 'tasks/list', pathMatch: 'full' },
      { path: 'tasks/list', loadComponent: () => import('app/tasks/list/list.component').then(m => m.TasksListComponent) },
      { path: 'tasks/:id', loadComponent: () => import('app/tasks/details/details.component').then(m => m.TasksDetailsComponent), canDeactivate: [CanDeactivateTasksDetails] },
      { path: 'noseperolodejopormodule/form', loadComponent: () => import('app/modules/full/neuron/form/form.component').then(m => m.FormComponent) },
      { path: 'massive/:template', loadComponent: () => import('app/massive/massive.component').then(m => m.MassiveComponent) },
      { path: 'massive/:template/:server', loadComponent: () => import('app/massive/massive.component').then(m => m.MassiveComponent) },
      { path: 'account', loadComponent: () => import('app/accounting/accounting.component').then(m => m.AccountComponent) },
      { path: 'persons', component: PersonsComponent },
      { path: '**', redirectTo: 'main' },
    ]


  }
];
