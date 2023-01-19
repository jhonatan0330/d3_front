import { ChangeDetectionStrategy, Component, Input,  ViewChild,  ViewEncapsulation } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';

@Component({
    selector       : 'gps',
    templateUrl    : './gps.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GPSComponent
{
    @ViewChild('drawer') drawer: MatDrawer;
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    /**
     * Constructor
     */
    constructor()
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    
}
