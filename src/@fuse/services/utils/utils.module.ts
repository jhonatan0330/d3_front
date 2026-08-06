import { NgModule, inject } from '@angular/core';
import { FuseUtilsService } from '@fuse/services/utils/utils.service';

@NgModule({
    providers: [
        FuseUtilsService
    ]
})
export class FuseUtilsModule
{    private _fuseUtilsService = inject(FuseUtilsService);

}
