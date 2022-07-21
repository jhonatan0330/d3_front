import { Route } from '@angular/router';
import { ProfileComponent } from 'app/modules/admin/dashboards/profile/profile.component';

export const profileRoutes: Route[] = [
    {
        path     : '',
        component: ProfileComponent
    }
];
