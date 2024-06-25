import { NgModule } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { TrazabilityComponent } from './trazability/trazability.component';
import { MatIconModule } from '@angular/material/icon';
import { TraceResumeComponent } from './trace-resume/trace-resume.component';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
    declarations: [
        TrazabilityComponent,
        TraceResumeComponent
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
        MatSelectModule,
        MatInputModule,
        MatIconModule,
        SharedModule
    ],
    exports : [
        TrazabilityComponent,
        TraceResumeComponent
    ]
})
export class DocumentTransitionModule
{
}
