import { Route } from '@angular/router';
import { LayoutComponent } from 'app/layout/layout.component';
import { AuthGuard } from './authentication/business/authentication.guard';
import { SignInSplitScreenReversedComponent } from './authentication/components/sign-in/sign-in.component';


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
      { path: 'sessions/recover', loadComponent: () => import('app/authentication/components/recover-password/recover-password.component').then(m => m.RecoverPasswordComponent) },
      { path: 'sessions/new/:id', loadComponent: () => import('app/authentication/components/new-password/new-password.component').then(m => m.NewPasswordComponent) },
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
      { path: 'massive/:template', loadComponent: () => import('app/massiveload/components/massiveload-view/massive.component').then(m => m.MassiveComponent) },
      { path: 'massive/:template/:server', loadComponent: () => import('app/massiveload/components/massiveload-view/massive.component').then(m => m.MassiveComponent) },
      { path: 'account', loadComponent: () => import('app/accounting/components/accounting-view/accounting.component').then(m => m.AccountComponent) },
      { path: 'persons', loadComponent: () => import('app/users/components/users-view/users.component').then(m => m.PersonsComponent) },

      // CONFIGURACIÓN - Tabbed layout
      {
        path: 'config',
        loadComponent: () => import('app/configuration/components/config/config.component').then(m => m.ConfigComponent),
        children: [
          { path: '', redirectTo: 'web-services', pathMatch: 'full' },

          { path: 'web-services', children: [
            { path: '', loadComponent: () => import('app/configuration/components/web-services/web-service-list/web-service-list.component').then(m => m.WebServiceListComponent) },
            { path: 'new', loadComponent: () => import('app/configuration/components/web-services/web-service-form/web-service-form.component').then(m => m.WebServiceFormComponent) },
            { path: ':id/edit', loadComponent: () => import('app/configuration/components/web-services/web-service-form/web-service-form.component').then(m => m.WebServiceFormComponent) },
            { path: ':id', loadComponent: () => import('app/configuration/components/web-services/web-service-form/web-service-form.component').then(m => m.WebServiceFormComponent) },
          ]},
          { path: 'web-service-executions', children: [
            { path: '', loadComponent: () => import('app/configuration/components/web-services/web-service-execute-list/web-service-execute-list.component').then(m => m.WebServiceExecuteListComponent) },
          ]},
          { path: 'messages', children: [
            { path: '', loadComponent: () => import('app/configuration/components/messages/message-list/message-list.component').then(m => m.MessageListComponent) },
          ]},
          { path: 'message-templates', children: [
            { path: '', loadComponent: () => import('app/configuration/components/messages/message-template-list/message-template-list.component').then(m => m.MessageTemplateListComponent) },
          ]},
          { path: 'document-templates', children: [
            { path: '', loadComponent: () => import('app/configuration/components/document-templates/document-template-list/document-template-list.component').then(m => m.DocumentTemplateListComponent) },
            { path: 'new', loadComponent: () => import('app/configuration/components/document-templates/document-template-form/document-template-form.component').then(m => m.DocumentTemplateFormComponent) },
            { path: ':id/edit', loadComponent: () => import('app/configuration/components/document-templates/document-template-form/document-template-form.component').then(m => m.DocumentTemplateFormComponent) },
            { path: ':id', loadComponent: () => import('app/configuration/components/document-templates/document-template-form/document-template-form.component').then(m => m.DocumentTemplateFormComponent) },
          ]},
          { path: 'document-templates/fields', children: [
            { path: '', loadComponent: () => import('app/configuration/components/document-templates/document-template-fields/document-template-field-list/document-template-field-list.component').then(m => m.DocumentTemplateFieldListComponent) },
            { path: 'new', loadComponent: () => import('app/configuration/components/document-templates/document-template-fields/document-template-field-form/document-template-field-form.component').then(m => m.DocumentTemplateFieldFormComponent) },
            { path: ':id/edit', loadComponent: () => import('app/configuration/components/document-templates/document-template-fields/document-template-field-form/document-template-field-form.component').then(m => m.DocumentTemplateFieldFormComponent) },
            { path: ':id', loadComponent: () => import('app/configuration/components/document-templates/document-template-fields/document-template-field-detail.component').then(m => m.DocumentTemplateFieldDetailComponent) },
          ]},
          { path: 'document-templates/reports', children: [
            { path: '', loadComponent: () => import('app/configuration/components/document-templates/document-template-reports/document-template-report-list/document-template-report-list.component').then(m => m.DocumentTemplateReportListComponent) },
            { path: 'new', loadComponent: () => import('app/configuration/components/document-templates/document-template-reports/document-template-report-form/document-template-report-form.component').then(m => m.DocumentTemplateReportFormComponent) },
            { path: ':id/edit', loadComponent: () => import('app/configuration/components/document-templates/document-template-reports/document-template-report-form/document-template-report-form.component').then(m => m.DocumentTemplateReportFormComponent) },
          ]},
          { path: 'auto-tasks', children: [
            { path: '', loadComponent: () => import('app/configuration/components/auto-tasks/auto-task-list/auto-task-list.component').then(m => m.AutoTaskListComponent) },
            { path: 'new', loadComponent: () => import('app/configuration/components/auto-tasks/auto-task-form/auto-task-form.component').then(m => m.AutoTaskFormComponent) },
            { path: ':id/edit', loadComponent: () => import('app/configuration/components/auto-tasks/auto-task-form/auto-task-form.component').then(m => m.AutoTaskFormComponent) },
            { path: ':id', loadComponent: () => import('app/configuration/components/auto-tasks/auto-task-form/auto-task-form.component').then(m => m.AutoTaskFormComponent) },
          ]},
          { path: 'processes', children: [
            { path: '', loadComponent: () => import('app/configuration/components/processes/process-list/process-list.component').then(m => m.ProcessListComponent) },
            { path: 'new', loadComponent: () => import('app/configuration/components/processes/process-form/process-form.component').then(m => m.ProcessFormComponent) },
            { path: ':id/edit', loadComponent: () => import('app/configuration/components/processes/process-form/process-form.component').then(m => m.ProcessFormComponent) },
            { path: ':id', loadComponent: () => import('app/configuration/components/processes/process-form/process-form.component').then(m => m.ProcessFormComponent) },
          ]},
          { path: 'processes/transitions', children: [
            { path: '', loadComponent: () => import('app/configuration/components/processes/process-transitions/process-transition-list/process-transition-list.component').then(m => m.ProcessTransitionListComponent) },
            { path: 'new', loadComponent: () => import('app/configuration/components/processes/process-transitions/process-transition-form/process-transition-form.component').then(m => m.ProcessTransitionFormComponent) },
            { path: ':id/edit', loadComponent: () => import('app/configuration/components/processes/process-transitions/process-transition-form/process-transition-form.component').then(m => m.ProcessTransitionFormComponent) },
          ]},
          { path: 'organizations', children: [
            { path: '', loadComponent: () => import('app/configuration/components/organizations/organization-list/organization-list.component').then(m => m.OrganizationListComponent) },
            { path: 'new', loadComponent: () => import('app/configuration/components/organizations/organization-form/organization-form.component').then(m => m.OrganizationFormComponent) },
            { path: ':id/edit', loadComponent: () => import('app/configuration/components/organizations/organization-form/organization-form.component').then(m => m.OrganizationFormComponent) },
            { path: ':id', loadComponent: () => import('app/configuration/components/organizations/organization-form/organization-form.component').then(m => m.OrganizationFormComponent) },
          ]},
          { path: 'consecutives', children: [
            { path: '', loadComponent: () => import('app/configuration/components/consecutives/consecutive-list/consecutive-list.component').then(m => m.ConsecutiveListComponent) },
            { path: 'new', loadComponent: () => import('app/configuration/components/consecutives/consecutive-form/consecutive-form.component').then(m => m.ConsecutiveFormComponent) },
            { path: ':id/edit', loadComponent: () => import('app/configuration/components/consecutives/consecutive-form/consecutive-form.component').then(m => m.ConsecutiveFormComponent) },
            { path: ':id', loadComponent: () => import('app/configuration/components/consecutives/consecutive-form/consecutive-form.component').then(m => m.ConsecutiveFormComponent) },
          ]},
          { path: 'servers', children: [
            { path: '', loadComponent: () => import('app/configuration/components/servers/server-list/server-list.component').then(m => m.ServerListComponent) },
            { path: 'new', loadComponent: () => import('app/configuration/components/servers/server-form/server-form.component').then(m => m.ServerFormComponent) },
            { path: ':id/edit', loadComponent: () => import('app/configuration/components/servers/server-form/server-form.component').then(m => m.ServerFormComponent) },
            { path: ':id', loadComponent: () => import('app/configuration/components/servers/server-form/server-form.component').then(m => m.ServerFormComponent) },
          ]},
          { path: 'property-values', children: [
            { path: '', loadComponent: () => import('app/configuration/components/property-values/property-value-list/property-value-list.component').then(m => m.PropertyValueListComponent) },
            { path: 'new', loadComponent: () => import('app/configuration/components/property-values/property-value-form/property-value-form.component').then(m => m.PropertyValueFormComponent) },
            { path: ':id/edit', loadComponent: () => import('app/configuration/components/property-values/property-value-form/property-value-form.component').then(m => m.PropertyValueFormComponent) },
            { path: ':id', loadComponent: () => import('app/configuration/components/property-values/property-value-form/property-value-form.component').then(m => m.PropertyValueFormComponent) },
          ]},
          { path: 'indicators', children: [
            { path: '', loadComponent: () => import('app/configuration/components/indicators/indicator-list/indicator-list.component').then(m => m.IndicatorListComponent) },
            { path: 'new', loadComponent: () => import('app/configuration/components/indicators/indicator-form/indicator-form.component').then(m => m.IndicatorFormComponent) },
            { path: ':id/edit', loadComponent: () => import('app/configuration/components/indicators/indicator-form/indicator-form.component').then(m => m.IndicatorFormComponent) },
            { path: ':id', loadComponent: () => import('app/configuration/components/indicators/indicator-form/indicator-form.component').then(m => m.IndicatorFormComponent) },
          ]},
          { path: 'properties', loadComponent: () => import('app/configuration/components/shared/property-field/property-field.component').then(m => m.PropertyFieldComponent) },
          { path: 'tree-compare', loadComponent: () => import('app/configuration/components/tree-compare/tree-compare.component').then(m => m.TreeCompareComponent) },
        ]
      },

      { path: '**', redirectTo: 'main' },
    ]


  }
];