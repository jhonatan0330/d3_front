import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';


import { SearchModule } from 'app/layout/common/search/search.module';



import { ClassyLayoutComponent } from 'app/layout/layouts/vertical/classy/classy.component';

import { SearchPopButtonComponent } from 'app/layout/common/search-pop/search-pop.component';

@NgModule({
    imports: [
    RouterModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatMenuModule,
    SearchModule,
    ClassyLayoutComponent,
    SearchPopButtonComponent
],
    exports: [
        ClassyLayoutComponent
    ]
})
export class ClassyLayoutModule
{
}
