import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { SharedMaterialModule } from 'app/shared/shared-material.module';
import { SharedModule } from 'app/shared/shared.module';
import { TrazabilityComponent } from './trazability/trazability.component';

@NgModule({
    declarations: [
        TrazabilityComponent
    ],
    imports     : [
        RouterModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
        FlexLayoutModule,
        SharedMaterialModule,
        SharedModule
    ],
    exports : [
        TrazabilityComponent
    ]
})
export class DocumentTransitionModule
{
}
