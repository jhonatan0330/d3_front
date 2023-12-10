import { Route } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';

export const profileRoutes: Route[] = [
  {
    path: 'main',
    component: ProfileComponent
  },
  {
    path: 'main/:type/:id',
    component: ProfileComponent
  }
  
  // Lo retiro porque hacia conflicto con task
  /*,
  {
    path: ':type/:id',
    component: ProfileComponent
  },*/
];
