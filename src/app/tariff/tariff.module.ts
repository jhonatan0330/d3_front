import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { TariffComponent } from './tariff.component';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { FeeFormComponent } from './fee-form/fee-form.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';

@NgModule({
    declarations: [
        TariffComponent,
        FeeFormComponent
    ],
    imports: [
        RouterModule.forChild([
            {
                path: ':templateId/:tariffId',
                component: TariffComponent
            }
        ]),
        MatProgressSpinnerModule,
        MatButtonModule,
        MatIconModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule, 
        MatInputModule,
        MatTableModule,
        MatAutocompleteModule,
        SharedModule
    ],
    exports: [
        TariffComponent,
        FeeFormComponent
    ]
})
export class TariffModule {
}
