import { Route } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';
import { InitialDataResolver } from 'app/app.resolvers';
import { VotarComponent } from './views/survey/votar/votar.component';
import { ConfigComponent } from './views/survey/config/config.component';
import { CrudsComponent } from './views/cruds/cruds.component';
import { MainComponent } from './views/main/main.component';

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [

    // Redirect empty path to '/profile'
    {path: '', pathMatch : 'full', redirectTo: 'main'},

    // Redirect signed in user to the '/profile'
    //
    // After the user signs in, the sign in page will redirect the user to the 'signed-in-redirect'
    // path. Below is another redirection for that path to redirect the user to the desired
    // location. This is a small convenience to keep all main routes together here on this file.
    {path: 'signed-in-redirect', pathMatch : 'full', redirectTo: 'main'},

    // Auth routes for guests
    {
        path: '',
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'confirmation-required', loadChildren: () => import('app/modules/auth/confirmation-required/confirmation-required.module').then(m => m.AuthConfirmationRequiredModule)},
            {path: 'forgot-password', loadChildren: () => import('app/modules/auth/forgot-password/forgot-password.module').then(m => m.AuthForgotPasswordModule)},
            {path: 'reset-password', loadChildren: () => import('app/modules/auth/reset-password/reset-password.module').then(m => m.AuthResetPasswordModule)},
            {path: 'sign-in', loadChildren: () => import('app/modules/auth/sign-in/sign-in.module').then(m => m.AuthSignInModule)},
            {path: 'sign-up', loadChildren: () => import('app/modules/auth/sign-up/sign-up.module').then(m => m.AuthSignUpModule)}
        ]
    },

    // Auth routes for authenticated users
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'sign-out', loadChildren: () => import('app/modules/auth/sign-out/sign-out.module').then(m => m.AuthSignOutModule)},
            {path: 'unlock-session', loadChildren: () => import('app/modules/auth/unlock-session/unlock-session.module').then(m => m.AuthUnlockSessionModule)}
        ]
    },
    

    // Admin routes
    {
        path       : '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component  : LayoutComponent,
        resolve    : {
            initialData: InitialDataResolver,
        },
        children   : [
          // Golyat components
          {
            path: 'main',
            component: MainComponent,
            data: { title: '', breadcrumb: 'MENU PRINCIPAL'}
          },
          {
            path: 'main/:type/:id',
            component: MainComponent,
            data: { title: '', breadcrumb: 'MENU PRINCIPAL'}
          },
          {
            path: 'list/:type/:id',
            component: CrudsComponent,
            data: { title: '', breadcrumb: 'MENU 2'}
          },
          {
            path: 'list/:type/:id/:server_id',
            component: CrudsComponent,
            data: { title: '', breadcrumb: 'MENU 2'}
          },
          {
            path: 'UIVotante',
            component: ConfigComponent,
            data: { title: '', breadcrumb: 'MENU 2'}
          },
          {
            path: 'UIVotacion',
            component: VotarComponent,
            data: { title: '', breadcrumb: 'MENU 2'}
          },
            {path: 'profile', loadChildren: () => import('app/modules/admin/dashboards/profile/profile.module').then(m => m.ProfileModule)},
            // Apps
            /*{path: 'apps', children: [
                {path: 'academy', loadChildren: () => import('app/modules/admin/apps/academy/academy.module').then(m => m.AcademyModule)},
                {path: 'chat', loadChildren: () => import('app/modules/admin/apps/chat/chat.module').then(m => m.ChatModule)},
                {path: 'mailbox', loadChildren: () => import('app/modules/admin/apps/mailbox/mailbox.module').then(m => m.MailboxModule)},
                {path: 'tasks', loadChildren: () => import('app/modules/admin/apps/tasks/tasks.module').then(m => m.TasksModule)},
            ]},*/

            // 404 & Catch all
            {path: '404-not-found', pathMatch: 'full', loadChildren: () => import('app/modules/admin/pages/error/error-404/error-404.module').then(m => m.Error404Module)},
            {path: '**', redirectTo: '404-not-found'}
        ]
    },
    {
      path: '**',
      redirectTo: 'sessions/404'
    }
];
