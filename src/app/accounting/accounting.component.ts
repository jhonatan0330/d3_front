import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { Subject, takeUntil } from 'rxjs';
import { CatalogFormComponent } from './catalog-form/catalog-form.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'accounting',
    templateUrl: './accounting.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class AccountComponent implements OnInit, OnDestroy {
    @ViewChild('drawer') drawer: MatDrawer;

    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _matDialog: MatDialog,) {
    }

    ngOnInit(): void {
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) =>
            {
                if ( matchingAliases.includes('md') )
                {
                    this.drawerMode = 'side';
                    this.drawerOpened = true;
                }
                else
                {
                    this.drawerMode = 'over';
                    this.drawerOpened = false;
                }
            });
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    openComposeDialog(): void {
        const dialogRef = this._matDialog.open(CatalogFormComponent);
        dialogRef.afterClosed().subscribe();
    }

}
