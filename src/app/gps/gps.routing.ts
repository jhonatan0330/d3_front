import { Route } from '@angular/router';
import { GPSComponent } from './gps.component';
import { DevicesListComponent } from './list/list.component';

export const gpsRoutes: Route[] = [
    {
        path     : '',
        component: GPSComponent,
        children : [
            {
                path     : '',
                component: DevicesListComponent,
                /*children : [
                    {
                        path         : ':id',
                        component    : ContactsDetailsComponent,
                        resolve      : {
                            contact  : ContactsContactResolver,
                            countries: ContactsCountriesResolver
                        },
                        canDeactivate: [CanDeactivateContactsDetails]
                    }
                ]*/
            }
        ]
    }
];
