import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { SharedMaterialModule } from 'app/shared/shared-material.module';
import { SharedModule } from 'app/shared/shared.module';
import { CatalogComponent } from './catalog/catalog.component';
import { InventoryService } from './inventory.service';
import { ProductComponent } from './product/product.component';
import { StockComponent } from './stock/stock.component';

@NgModule({
    declarations: [
        StockComponent,
        ProductComponent,
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
        FlexLayoutModule,
        SharedMaterialModule,
        SharedModule
    ],
    exports : [
        ProductComponent
    ]
})
export class InventoryModule
{
}
