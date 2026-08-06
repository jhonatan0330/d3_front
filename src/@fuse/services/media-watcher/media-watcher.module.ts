import { NgModule, inject } from '@angular/core';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher/media-watcher.service';

@NgModule({
    providers: [
        FuseMediaWatcherService
    ]
})
export class FuseMediaWatcherModule
{    private _fuseMediaWatcherService = inject(FuseMediaWatcherService);

}
