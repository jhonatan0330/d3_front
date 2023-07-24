import { NgModule } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { MassiveComponent } from './massive.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';

@NgModule({
    declarations: [
        MassiveComponent
    ],
    imports     : [
        RouterModule.forChild([
            {
                path     : ':template',
                component: MassiveComponent
            },
            {
                path     : ':template/:server',
                component: MassiveComponent
            }
        ]),
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
        MatProgressBarModule,
        MatIconModule,
        MatButtonModule,
        MatTableModule,
        SharedModule
    ],
    exports : [
        MassiveComponent
    ]
})
export class MassiveModule
{
}
