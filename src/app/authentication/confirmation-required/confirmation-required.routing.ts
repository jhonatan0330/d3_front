import { Route } from '@angular/router';
import { AuthConfirmationRequiredComponent } from 'app/authentication/confirmation-required/confirmation-required.component';

export const authConfirmationRequiredRoutes: Route[] = [
    {
        path     : '',
        component: AuthConfirmationRequiredComponent
    }
];
