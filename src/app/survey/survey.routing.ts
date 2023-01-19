import { Route } from '@angular/router';
import { VotarComponent } from './votar/votar.component';

export const surveyRoutes: Route[] = [
    {
        path: '',
        component: VotarComponent
      }
];
