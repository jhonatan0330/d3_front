import { Route } from '@angular/router';
import { ConfigComponent } from 'app/modules/full/neuron/views/survey/config/config.component';
import { MainComponent } from './main/main.component';
import { CrudsComponent } from './views/cruds/cruds.component';
import { VotarComponent } from './views/survey/votar/votar.component';

export const neuronRoutes: Route[] = [
    // Golyat components
    {
        path: '',
        component: MainComponent
      },
      {
        path: '/:type/:id',
        component: MainComponent,
        data: { title: '', breadcrumb: 'MENU PRINCIPAL' }
      },
      {
        path: 'list/:type/:id',
        component: CrudsComponent,
        data: { title: '', breadcrumb: 'MENU 2' }
      },
      {
        path: 'list/:type/:id/:server_id',
        component: CrudsComponent,
        data: { title: '', breadcrumb: 'MENU 2' }
      },
      {
        path: 'UIVotante',
        component: ConfigComponent,
        data: { title: '', breadcrumb: 'MENU 2' }
      },
      {
        path: 'UIVotacion',
        component: VotarComponent
      }
];
