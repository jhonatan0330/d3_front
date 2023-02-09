import { Route } from '@angular/router';
import { ProfileComponent } from './profile.component';

export const profileRoutes: Route[] = [
  {
    path: 'main',
    component: ProfileComponent
  },
  {
    path: 'main/:type/:id',
    component: ProfileComponent
  },
  {
    path: ':type/:id',
    component: ProfileComponent
  },
];
