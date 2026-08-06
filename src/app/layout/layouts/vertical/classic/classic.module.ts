import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';


import { SearchModule } from 'app/layout/common/search/search.module';




import { ClassicLayoutComponent } from 'app/layout/layouts/vertical/classic/classic.component';


@NgModule({
    imports: [
    RouterModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatMenuModule,
    SearchModule,
    ClassicLayoutComponent
],
    exports: [
        ClassicLayoutComponent
    ]
})
export class ClassicLayoutModule
{
}
