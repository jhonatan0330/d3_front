import { NgModule } from '@angular/core';
import { FuseScrollbarDirective } from '@fuse/directives/scrollbar/scrollbar.directive';

@NgModule({
    imports: [FuseScrollbarDirective],
    exports: [
        FuseScrollbarDirective
    ]
})
export class FuseScrollbarModule
{
}
