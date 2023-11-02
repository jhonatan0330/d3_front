import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { FuseNavigationModule } from '@fuse/components/navigation';
import { accountRoutes } from 'app/accounting/accounting.routing';
import { SharedModule } from 'app/shared/shared.module';
import { FinanceComponent } from './finance/finance.component';
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

@NgModule({
    declarations: [
        CatalogFormComponent,
        AccountComponent,
        FinanceComponent
    ],
    imports     : [
        RouterModule.forChild(accountRoutes),
        MatButtonModule,
        MatIconModule,
        SharedModule,
        FuseNavigationModule,
        MatMenuModule, 
        MatDividerModule, 
        NgApexchartsModule, 
        MatTableModule,
        MatDatepickerModule,
        MatSortModule,
        NgClass,
        MatProgressBarModule,
        CurrencyPipe,
        DatePipe,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule, 
        MatInputModule,
        MatSidenavModule
       ]
})
export class AccountingModule
{
}
