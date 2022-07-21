import { Routes } from '@angular/router';
import { CrudsComponent } from './cruds/cruds.component';
import { MainComponent } from './main/main.component';


export const bpmRoutes: Routes = [
  {
    path: '',
    redirectTo: 'main',
    pathMatch: 'full'
  },
  {
    path: '',
    children: [
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
      }
    ]
  }
];

