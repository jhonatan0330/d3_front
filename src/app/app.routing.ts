import { Route } from '@angular/router';
import { LayoutComponent } from 'app/layout/layout.component';
import { AuthGuard } from './authentication/authentication.guard';
import { SignInSplitScreenReversedComponent } from './authentication/sign-in/split-screen-reversed/sign-in.component';
import { PersonsComponent } from './persons/persons.component';
import { CanDeactivateTasksDetails } from './tasks/tasks.guards';

// @formatter:off
 
 
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
      { path: 'main', loadComponent: () => import('app/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'main/:type', loadComponent: () => import('app/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'main/:type/:id', loadComponent: () => import('app/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'list/:type/:id', loadComponent: () => import('app/cruds/cruds2.component').then(m => m.Cruds2Component) },
      { path: 'list/:type/:id/:server_id', loadComponent: () => import('app/cruds/cruds2.component').then(m => m.Cruds2Component) },
      { path: 'tasks', redirectTo: 'tasks/list', pathMatch: 'full' },
      {
        path: 'tasks/list',
        loadComponent: () => import('app/tasks/list/list.component').then(m => m.TasksListComponent),
        children: [
          { path: ':id', loadComponent: () => import('app/tasks/details/details.component').then(m => m.TasksDetailsComponent), canDeactivate: [CanDeactivateTasksDetails] }
        ]
      },
      { path: 'massive/:template', loadComponent: () => import('app/massive/massive.component').then(m => m.MassiveComponent) },
      { path: 'massive/:template/:server', loadComponent: () => import('app/massive/massive.component').then(m => m.MassiveComponent) },
      { path: 'account', loadComponent: () => import('app/accounting/accounting.component').then(m => m.AccountComponent) },
      { path: 'persons', component: PersonsComponent },
      { path: '**', redirectTo: 'main' },
    ]


  }
];
