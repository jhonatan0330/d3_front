import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';


import { SearchModule } from 'app/layout/common/search/search.module';



import { ThinLayoutComponent } from 'app/layout/layouts/vertical/thin/thin.component';


@NgModule({
    imports: [
    RouterModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatMenuModule,
    SearchModule,
    ThinLayoutComponent
],
    exports: [
        ThinLayoutComponent
    ]
})
export class ThinLayoutModule
{
}
