import { Route } from '@angular/router';
import { SettingsComponent } from 'app/authentication/settings/settings.component';

export const settingsRoutes: Route[] = [
    {
        path     : '',
        component: SettingsComponent
    }
];
