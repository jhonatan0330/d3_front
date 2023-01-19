import { Route } from '@angular/router';
import { CrudsComponent } from './cruds.component';

export const crudsRoutes: Route[] = [
  {
    path: '',
    component: CrudsComponent,
    children: [
      {
        path: ':type/:id',
        component: CrudsComponent
      },
      {
        path: ':type/:id/:server_id',
        component: CrudsComponent
      }
    ]
  }
];
