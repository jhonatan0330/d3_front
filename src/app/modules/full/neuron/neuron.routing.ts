import { Route } from '@angular/router';
import { ConfigComponent } from 'app/modules/full/neuron/views/survey/config/config.component';
import { MainComponent } from './main/main.component';
import { ProfileComponent } from './profile/profile.component';
import { CrudsComponent } from './views/cruds/cruds.component';
import { VotarComponent } from './views/survey/votar/votar.component';

export const neuronRoutes: Route[] = [
    // Golyat components
    {
        path: 'main',
        component: ProfileComponent
      },
      {
        path: ':type/:id',
        component: MainComponent
      },
      {
        path: 'list/:type/:id',
        component: CrudsComponent
      },
      {
        path: 'list/:type/:id/:server_id',
        component: CrudsComponent
      },
      {
        path: 'UIVotante',
        component: ConfigComponent
      },
      {
        path: 'UIVotacion',
        component: VotarComponent
      }
];
