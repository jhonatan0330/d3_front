import { Route } from '@angular/router';
import { Cruds2Component } from './cruds2.component';

export const crudsRoutes: Route[] = [
  {
    path: ':type/:id',
    component: Cruds2Component
  },
  {
    path: ':type/:id/:server_id',
    component: Cruds2Component
  }
];
