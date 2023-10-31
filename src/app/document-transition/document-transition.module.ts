import { NgModule } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { TrazabilityComponent } from './trazability/trazability.component';
import { MatIconModule } from '@angular/material/icon';

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
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        SharedModule
    ],
    exports : [
        TrazabilityComponent
    ]
})
export class DocumentTransitionModule
{
}
