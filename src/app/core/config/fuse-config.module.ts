import { ModuleWithProviders, NgModule, inject } from '@angular/core';
import { FuseConfigService } from 'app/core/config/fuse-config.service';
import { FUSE_APP_CONFIG } from 'app/core/config/fuse-config.constants';

@NgModule()
export class FuseConfigModule
{
    private _fuseConfigService = inject(FuseConfigService);


    /**
     * forRoot method for setting user configuration
     *
     * @param config
     */
    static forRoot(config: any): ModuleWithProviders<FuseConfigModule>
    {
        return {
            ngModule : FuseConfigModule,
            providers: [
                {
                    provide : FUSE_APP_CONFIG,
                    useValue: config
                }
            ]
        };
    }
}
