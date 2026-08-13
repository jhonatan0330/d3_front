import { NgModule, inject } from '@angular/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';

@NgModule({
    imports  : [    ],
    providers: [
        {
            // Use the 'fill' appearance on Angular Material form fields by default
            provide : MAT_FORM_FIELD_DEFAULT_OPTIONS,
            useValue: {
                appearance: 'fill'
            }
        }
    ]
})
export class FuseModule
{
    /**
     * Constructor
     */
    constructor()
    {
        const parentModule = inject(FuseModule, { optional: true, skipSelf: true });

        if ( parentModule )
        {
            throw new Error('FuseModule has already been loaded. Import this module in the AppModule only!');
        }
    }
}
