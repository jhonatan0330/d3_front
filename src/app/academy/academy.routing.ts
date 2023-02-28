import { Route } from '@angular/router';
import { AcademyComponent } from 'app/academy/academy.component';
import { AcademyListComponent } from 'app/academy/list/list.component';
import { AcademyDetailsComponent } from 'app/academy/details/details.component';

export const academyRoutes: Route[] = [
    {
        path     : '',
        component: AcademyComponent,
        children : [
            {
                path     : '',
                pathMatch: 'full',
                component: AcademyListComponent
            },
            {
                path     : ':id',
                component: AcademyDetailsComponent
            }
        ]
    }
];
