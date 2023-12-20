import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedModule } from 'app/shared/shared.module';
import { TasksComponent } from 'app/tasks/tasks.component';
import { TasksDetailsComponent } from 'app/tasks/details/details.component';
import { TasksListComponent } from 'app/tasks/list/list.component';
import { CanDeactivateTasksDetails } from './tasks.guards';

@NgModule({
    declarations: [
        TasksComponent,
        TasksDetailsComponent,
        TasksListComponent
    ],
    imports     : [
        RouterModule.forChild([
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
        ]),
        DragDropModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatDividerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatProgressBarModule,
        MatRadioModule,
        MatRippleModule,
        MatSelectModule,
        MatSidenavModule,
        MatTooltipModule,
        SharedModule
    ]
})
export class TasksModule
{
}
