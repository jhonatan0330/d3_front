import { NgModule, inject } from '@angular/core';
import { FusePlatformService } from '@fuse/services/platform/platform.service';

@NgModule({
    providers: [
        FusePlatformService
    ]
})
export class FusePlatformModule
{    private _fusePlatformService = inject(FusePlatformService);

}
