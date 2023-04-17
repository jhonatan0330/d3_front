import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { CatalogComponent } from './catalog/catalog.component';
import { StockComponent } from './stock/stock.component';
import { MatTableModule } from '@angular/material/table';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
    declarations: [
        StockComponent,
        CatalogComponent
    ],
    imports     : [
        RouterModule.forChild([
            {
                path     : '',
                component: StockComponent
            }
        ]),
        MatFormFieldModule,
        MatInputModule,
        MatTableModule,
        MatAutocompleteModule,
        MatIconModule,
        FlexLayoutModule,
        SharedModule
    ],
    exports : [
    ]
})
export class InventoryModule
{
}
