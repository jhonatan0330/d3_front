import { NgModule, inject } from '@angular/core';
import { IconsModule } from 'app/core/icons/icons.module';

@NgModule({
    imports: [
        IconsModule,
    ]
})
export class CoreModule
{
    /**
     * Constructor
     */
    constructor()
    {
        const parentModule = inject(CoreModule, { optional: true, skipSelf: true });

        // Do not allow multiple injections
        if ( parentModule )
        {
            throw new Error('CoreModule has already been loaded. Import this module in the AppModule only.');
        }
    }
}
