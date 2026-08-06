import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';


import { SearchModule } from 'app/layout/common/search/search.module';



import { CenteredLayoutComponent } from 'app/layout/layouts/horizontal/centered/centered.component';


@NgModule({
    imports: [
    RouterModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatMenuModule,
    SearchModule,
    CenteredLayoutComponent
],
    exports: [
        CenteredLayoutComponent
    ]
})
export class CenteredLayoutModule
{
}
