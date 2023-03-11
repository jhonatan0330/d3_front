import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { SharedMaterialModule } from 'app/shared/shared-material.module';
import { SharedModule } from 'app/shared/shared.module';
import { MassiveComponent } from './massive.component';

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
        FlexLayoutModule,
        SharedMaterialModule,
        SharedModule
    ],
    exports : [
        MassiveComponent
    ]
})
export class MassiveModule
{
}
