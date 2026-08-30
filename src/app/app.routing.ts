import { Route } from '@angular/router';
import { LayoutComponent } from 'app/layout/layout.component';
import { AuthGuard } from './authentication/authentication.guard';
import { SignInSplitScreenReversedComponent } from './authentication/sign-in/split-screen-reversed/sign-in.component';

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
      { path: 'main', loadComponent: () => import('app/layout/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'main/:type', loadComponent: () => import('app/layout/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'main/:type/:id', loadComponent: () => import('app/layout/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'list/:type/:id', loadComponent: () => import('app/document/cruds/cruds2.component').then(m => m.Cruds2Component) },
      { path: 'list/:type/:id/:server_id', loadComponent: () => import('app/document/cruds/cruds2.component').then(m => m.Cruds2Component) },
      { path: 'tasks', loadComponent: () => import('app/task/task-view/tasks.component').then(m => m.TasksListComponent) },
      { path: 'massive/:template', loadComponent: () => import('app/massiveload/massiveload-view/massive.component').then(m => m.MassiveComponent) },
      { path: 'massive/:template/:server', loadComponent: () => import('app/massiveload/massiveload-view/massive.component').then(m => m.MassiveComponent) },
      { path: 'account', loadComponent: () => import('app/accounting/accounting-view/accounting.component').then(m => m.AccountComponent) },
      { path: 'persons', loadComponent: () => import('app/users/users-view/users.component').then(m => m.PersonsComponent) },

      // CONFIGURACIÓN - Tabbed layout
      {
        path: 'config',
        loadComponent: () => import('app/configuration/configuration-view/config.component').then(m => m.ConfigComponent),
        children: [
          { path: '', redirectTo: 'web-services', pathMatch: 'full' },

          { path: 'web-services', children: [
            { path: '', loadComponent: () => import('app/configuration/web-services/web-service-list.component').then(m => m.WebServiceListComponent) },
            { path: 'new', loadComponent: () => import('app/configuration/web-services/web-service-form.component').then(m => m.WebServiceFormComponent) },
            { path: ':id/edit', loadComponent: () => import('app/configuration/web-services/web-service-form.component').then(m => m.WebServiceFormComponent) },
            { path: ':id', loadComponent: () => import('app/configuration/web-services/web-service-form.component').then(m => m.WebServiceFormComponent) },
          ]},
          { path: 'messages', children: [
            { path: '', loadComponent: () => import('app/configuration/messages/message-list.component').then(m => m.MessageListComponent) },
            { path: ':id', loadComponent: () => import('app/configuration/messages/message-list.component').then(m => m.MessageListComponent) },
          ]},
          { path: 'message-templates', children: [
            { path: '', loadComponent: () => import('app/configuration/message-templates/message-template-list.component').then(m => m.MessageTemplateListComponent) },
            { path: 'new', loadComponent: () => import('app/configuration/message-templates/message-template-form.component').then(m => m.MessageTemplateFormComponent) },
            { path: ':id/edit', loadComponent: () => import('app/configuration/message-templates/message-template-form.component').then(m => m.MessageTemplateFormComponent) },
            { path: ':id', loadComponent: () => import('app/configuration/message-templates/message-template-form.component').then(m => m.MessageTemplateFormComponent) },
          ]},
          { path: 'document-templates', children: [
            { path: '', loadComponent: () => import('app/configuration/document-templates/document-template-list.component').then(m => m.DocumentTemplateListComponent) },
            { path: 'new', loadComponent: () => import('app/configuration/document-templates/document-template-form.component').then(m => m.DocumentTemplateFormComponent) },
            { path: ':id/edit', loadComponent: () => import('app/configuration/document-templates/document-template-form.component').then(m => m.DocumentTemplateFormComponent) },
            { path: ':id', loadComponent: () => import('app/configuration/document-templates/document-template-form.component').then(m => m.DocumentTemplateFormComponent) },
          ]},
          { path: 'document-templates/fields', children: [
            { path: '', loadComponent: () => import('app/configuration/document-templates/document-template-fields/document-template-field-list.component').then(m => m.DocumentTemplateFieldListComponent) },
            { path: 'new', loadComponent: () => import('app/configuration/document-templates/document-template-fields/document-template-field-form.component').then(m => m.DocumentTemplateFieldFormComponent) },
            { path: ':id/edit', loadComponent: () => import('app/configuration/document-templates/document-template-fields/document-template-field-form.component').then(m => m.DocumentTemplateFieldFormComponent) },
            { path: ':id', loadComponent: () => import('app/configuration/document-templates/document-template-fields/document-template-field-detail.component').then(m => m.DocumentTemplateFieldDetailComponent) },
          ]},
          { path: 'document-templates/reports', children: [
            { path: '', loadComponent: () => import('app/configuration/document-templates/document-template-reports/document-template-report-list.component').then(m => m.DocumentTemplateReportListComponent) },
            { path: 'new', loadComponent: () => import('app/configuration/document-templates/document-template-reports/document-template-report-form.component').then(m => m.DocumentTemplateReportFormComponent) },
            { path: ':id/edit', loadComponent: () => import('app/configuration/document-templates/document-template-reports/document-template-report-form.component').then(m => m.DocumentTemplateReportFormComponent) },
          ]},
          { path: 'auto-tasks', children: [
            { path: '', loadComponent: () => import('app/configuration/auto-tasks/auto-task-list.component').then(m => m.AutoTaskListComponent) },
            { path: 'new', loadComponent: () => import('app/configuration/auto-tasks/auto-task-form.component').then(m => m.AutoTaskFormComponent) },
            { path: ':id/edit', loadComponent: () => import('app/configuration/auto-tasks/auto-task-form.component').then(m => m.AutoTaskFormComponent) },
            { path: ':id', loadComponent: () => import('app/configuration/auto-tasks/auto-task-form.component').then(m => m.AutoTaskFormComponent) },
          ]},
          { path: 'processes', children: [
            { path: '', loadComponent: () => import('app/configuration/processes/process-list.component').then(m => m.ProcessListComponent) },
            { path: 'new', loadComponent: () => import('app/configuration/processes/process-form.component').then(m => m.ProcessFormComponent) },
            { path: ':id/edit', loadComponent: () => import('app/configuration/processes/process-form.component').then(m => m.ProcessFormComponent) },
            { path: ':id', loadComponent: () => import('app/configuration/processes/process-form.component').then(m => m.ProcessFormComponent) },
          ]},
          { path: 'processes/transitions', children: [
            { path: '', loadComponent: () => import('app/configuration/processes/process-transitions/process-transition-list.component').then(m => m.ProcessTransitionListComponent) },
            { path: 'new', loadComponent: () => import('app/configuration/processes/process-transitions/process-transition-form.component').then(m => m.ProcessTransitionFormComponent) },
            { path: ':id/edit', loadComponent: () => import('app/configuration/processes/process-transitions/process-transition-form.component').then(m => m.ProcessTransitionFormComponent) },
          ]},
          { path: 'organizations', children: [
            { path: '', loadComponent: () => import('app/configuration/organizations/organization-list.component').then(m => m.OrganizationListComponent) },
            { path: 'new', loadComponent: () => import('app/configuration/organizations/organization-form.component').then(m => m.OrganizationFormComponent) },
            { path: ':id/edit', loadComponent: () => import('app/configuration/organizations/organization-form.component').then(m => m.OrganizationFormComponent) },
            { path: ':id', loadComponent: () => import('app/configuration/organizations/organization-form.component').then(m => m.OrganizationFormComponent) },
          ]},
          { path: 'consecutives', children: [
            { path: '', loadComponent: () => import('app/configuration/consecutives/consecutive-list.component').then(m => m.ConsecutiveListComponent) },
            { path: 'new', loadComponent: () => import('app/configuration/consecutives/consecutive-form.component').then(m => m.ConsecutiveFormComponent) },
            { path: ':id/edit', loadComponent: () => import('app/configuration/consecutives/consecutive-form.component').then(m => m.ConsecutiveFormComponent) },
            { path: ':id', loadComponent: () => import('app/configuration/consecutives/consecutive-form.component').then(m => m.ConsecutiveFormComponent) },
          ]},
          { path: 'servers', children: [
            { path: '', loadComponent: () => import('app/configuration/servers/server-list.component').then(m => m.ServerListComponent) },
            { path: 'new', loadComponent: () => import('app/configuration/servers/server-form.component').then(m => m.ServerFormComponent) },
            { path: ':id/edit', loadComponent: () => import('app/configuration/servers/server-form.component').then(m => m.ServerFormComponent) },
            { path: ':id', loadComponent: () => import('app/configuration/servers/server-form.component').then(m => m.ServerFormComponent) },
          ]},
          { path: 'property-values', children: [
            { path: '', loadComponent: () => import('app/configuration/property-values/property-value-list.component').then(m => m.PropertyValueListComponent) },
            { path: 'new', loadComponent: () => import('app/configuration/property-values/property-value-form.component').then(m => m.PropertyValueFormComponent) },
            { path: ':id/edit', loadComponent: () => import('app/configuration/property-values/property-value-form.component').then(m => m.PropertyValueFormComponent) },
            { path: ':id', loadComponent: () => import('app/configuration/property-values/property-value-form.component').then(m => m.PropertyValueFormComponent) },
          ]},
          { path: 'properties', loadComponent: () => import('app/configuration/shared/property-field.component').then(m => m.PropertyFieldComponent) },
        ]
      },

      { path: '**', redirectTo: 'main' },
    ]


  }
];