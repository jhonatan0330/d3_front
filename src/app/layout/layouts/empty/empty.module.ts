import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { EmptyLayoutComponent } from 'app/layout/layouts/empty/empty.component';

@NgModule({
    imports: [
    RouterModule,
    EmptyLayoutComponent
],
    exports: [
        EmptyLayoutComponent
    ]
})
export class EmptyLayoutModule
{
}
