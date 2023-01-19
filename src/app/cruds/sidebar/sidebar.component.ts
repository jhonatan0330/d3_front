import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject, } from 'rxjs';
import { FuseNavigationItem, FuseNavigationService } from '@fuse/components/navigation';
import { CrudsService } from '../cruds.service';

@Component({
    selector     : 'cruds-sidebar',
    templateUrl  : './sidebar.component.html',
    styleUrls    : ['./sidebar.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class CrudsSidebarComponent implements OnInit, OnDestroy
{
    menuData: FuseNavigationItem[] = [];
    private _filtersMenuData: FuseNavigationItem[] = [];
    private _foldersMenuData: FuseNavigationItem[] = [];
    private _labelsMenuData: FuseNavigationItem[] = [];
    private _otherMenuData: FuseNavigationItem[] = [];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _crudsService: CrudsService,
        private _matDialog: MatDialog,
        private _fuseNavigationService: FuseNavigationService
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
        
        // Generate other menu links
        this._generateOtherMenuLinks();
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Generate other menus
     *
     * @private
     */
    private _generateOtherMenuLinks(): void
    {
        // Settings menu
        this._otherMenuData.push({
            title: 'Settings',
            type : 'basic',
            icon : 'heroicons_outline:cog',
            link : '/apps/mailbox/settings'
        });

        // Update the menu data
        this._updateMenuData();
    }

    /**
     * Update the menu data
     *
     * @private
     */
    private _updateMenuData(): void
    {
        this.menuData = [
            {
                title   : 'MAILBOXES',
                type    : 'group',
                children: [
                    ...this._foldersMenuData
                ]
            },
            {
                title   : 'FILTERS',
                type    : 'group',
                children: [
                    ...this._filtersMenuData
                ]
            },
            {
                title   : 'LABELS',
                type    : 'group',
                children: [
                    ...this._labelsMenuData
                ]
            },
            {
                type: 'spacer'
            },
            ...this._otherMenuData
        ];
    }
}
