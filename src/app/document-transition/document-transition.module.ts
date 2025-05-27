import { NgModule } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { TrazabilityComponent } from './trazability/trazability.component';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
    declarations: [
        TrazabilityComponent
    ],
    imports     : [
        RouterModule.forChild( [
            {
                path     : '',
                component: TrazabilityComponent
            }
        ]),
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
        DragDropModule,
        SharedModule
    ],
    exports : [
        TrazabilityComponent
    ]
})
export class DocumentTransitionModule
{
}
