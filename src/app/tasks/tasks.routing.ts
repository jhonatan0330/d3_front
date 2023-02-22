import { Route } from '@angular/router';
import { CanDeactivateTasksDetails } from 'app/tasks/tasks.guards';
import { TasksListComponent } from 'app/tasks/list/list.component';
import { TasksDetailsComponent } from 'app/tasks/details/details.component';

export const tasksRoutes: Route[] = [
    {
        path     : '',
        component: TasksListComponent,
        children : [
            {
                path         : ':id',
                component    : TasksDetailsComponent,
                canDeactivate: [CanDeactivateTasksDetails]
            }
        ]
    }
];
