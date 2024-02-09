import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { FuseNavigationModule } from '@fuse/components/navigation';
import { SharedModule } from 'app/shared/shared.module';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { NgApexchartsModule } from 'ng-apexcharts';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CatalogFormComponent } from './catalog-form/catalog-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSidenavModule } from '@angular/material/sidenav';
import { AccountComponent } from './accounting.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { AccountFormComponent } from './account-form/account-form.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { UploadFormComponent } from './upload/upload-form.component';
import { ManualFormComponent } from './manual-form/manual-form.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CurrencyMaskModule } from 'ng2-currency-mask';

@NgModule({
    declarations: [
        CatalogFormComponent,
        AccountFormComponent,
        UploadFormComponent,
        ManualFormComponent,
        AccountComponent
    ],
    imports     : [
        RouterModule.forChild([
            {
                path     : '',
                component: AccountComponent
            }
        ]),
        MatButtonModule,
        MatIconModule,
        SharedModule,
        FuseNavigationModule,
        MatMenuModule, 
        MatDividerModule, 
        NgApexchartsModule, 
        MatTableModule,
        MatDatepickerModule,
        MatAutocompleteModule,
        MatSortModule,
        MatProgressBarModule,
        CurrencyPipe,
        DatePipe,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule, 
        MatInputModule,
        MatSidenavModule,
        CurrencyMaskModule,
        MatProgressSpinnerModule
       ]
})
export class AccountingModule
{
}
