import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertType } from '@fuse/components/alert';

@Component({
    selector     : 'inventory-stock',
    templateUrl  : './stock.component.html',
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class StockComponent implements OnInit
{

    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: ''
    };
    showAlert: boolean = false;

    constructor(
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign in
     */
    register(): void
    {

        // Hide the alert
        this.showAlert = false;

        // Do your action here...
        // Emulate server delay
        setTimeout(() => {
       // Set the alert
            this.alert = {
                type   : 'success',
                message: 'You have been registered to the list.'
            };

        }, 1000);
    }
}
