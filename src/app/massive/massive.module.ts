import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { MassiveComponent } from './massive.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
    declarations: [
        MassiveComponent
    ],
    imports     : [
        RouterModule.forChild([
            {
                path     : '',
                component: MassiveComponent
            }
        ]),
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
        MatProgressBarModule,
        MatIconModule,
        FlexLayoutModule,
        SharedModule
    ],
    exports : [
        MassiveComponent
    ]
})
export class MassiveModule
{
}
