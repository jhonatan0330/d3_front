import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { Subject, takeUntil, Observable } from 'rxjs';
import { CatalogFormComponent } from './catalog-form/catalog-form.component';
import { MatDialog } from '@angular/material/dialog';
import { CatalogDTO } from './accounting.domain';
import { UntypedFormControl } from '@angular/forms';
import { AccountingService } from './accounting.service';

@Component({
    selector: 'accounting',
    templateUrl: './accounting.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class AccountComponent implements OnInit, OnDestroy {
    @ViewChild('drawer') drawer: MatDrawer;

    drawerMode: 'over' | 'side' = 'over';
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    catalogs: CatalogDTO[];
    catalogSelected: CatalogDTO;
    searchInputControl: UntypedFormControl = new UntypedFormControl();
    isLoading = false;

    constructor(private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _matDialog: MatDialog,
        private accountingService: AccountingService) {
    }

    ngOnInit(): void {
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {
                if (matchingAliases.includes('md')) {
                    this.drawerMode = 'side';
                }
                else {
                    this.drawerMode = 'over';
                }
            });
        this.getCatalogs();
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    openComposeDialog(): void {
        const dialogRef = this._matDialog.open(CatalogFormComponent);
        dialogRef.afterClosed().subscribe(() => this.getCatalogs());
    }

    getCatalogs() {
        this.accountingService.getCatalogs().subscribe({
            next: (dataResult: CatalogDTO[]) => {
                this.catalogs = dataResult;
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
            },
        });
    }

    selectCatalog(catalog: CatalogDTO) {
        this.catalogSelected = catalog;
    }
}
