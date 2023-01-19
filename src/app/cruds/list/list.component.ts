import { Component, Input } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';

@Component({
    selector   : 'cruds-list',
    templateUrl: './list.component.html'
})
export class CrudsListComponent
{
    @Input("sidebar")_crudsComponent: MatDrawer
    /**
     * Constructor
     */
    constructor()
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle the drawer
     */
    toggleDrawer(): void
    {
        // Toggle the drawer
        this._crudsComponent.toggle();
    }
}
