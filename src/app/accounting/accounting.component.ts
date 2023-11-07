import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { Subject, takeUntil, Observable } from 'rxjs';
import { CatalogFormComponent } from './catalog-form/catalog-form.component';
import { MatDialog } from '@angular/material/dialog';
import { AccountDTO, CatalogDTO, ResultMapDTO } from './accounting.domain';
import { UntypedFormControl } from '@angular/forms';
import { AccountingService } from './accounting.service';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { AccountFormComponent } from './account-form/account-form.component';
import { UploadFormComponent } from './upload/upload-form.component';

interface AccountNode {
    account: AccountDTO;
    children?: AccountNode[];
}

interface AccountFlatNode {
    expandable: boolean;
    name: string;
    code: string;
    status: string;
    level: number;
    key: string;
}

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
    isLoadingCatalog = false;
    isLoadingAccount = false;
    isLoadingBalance = false;

    balance: ResultMapDTO[];

    private transformer = (node: AccountNode, level: number) => {
        return {
            expandable: !!node.children && node.children.length > 0,
            key: node.account.key,
            name: node.account.name,
            code: node.account.code,
            wbs: node.account.wbs,
            status: node.account.status,
            level: level,
        };
    }

    displayedColumns: string[] = ['code', 'name', 'status', 'actions'];

    treeControl = new FlatTreeControl<AccountFlatNode>(
        node => node.level, node => node.expandable);

    treeFlattener = new MatTreeFlattener(
        this.transformer, node => node.level,
        node => node.expandable, node => node.children);

    dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

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

    toggleDrawer(): void {
        this.drawer.toggle();
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
        this.isLoadingCatalog = true;
        this.accountingService.getCatalogs().subscribe({
            next: (dataResult: CatalogDTO[]) => {
                this.catalogs = dataResult;
                this.isLoadingCatalog = false;
            },
            error: () => {
                this.isLoadingCatalog = false;
            },
        });
    }

    selectCatalog(catalog: CatalogDTO) {
        if (catalog && this.catalogSelected && catalog.key === this.catalogSelected.key) {
            return;
        }
        this.catalogSelected = catalog;
        this.drawer.close();
        this.getAccounts();
        this.getBalance();
    }

    getBalance() {
        this.balance = [];
        if (this.catalogSelected) {
            this.isLoadingBalance = true;
            this.accountingService.getBalance(this.catalogSelected.key).subscribe({
                next: (dataResult: ResultMapDTO[]) => {
                    this.balance = dataResult;
                    this.isLoadingBalance = false;
                },
                error: () => {
                    this.isLoadingBalance = false;
                },
            });
        } 
    }

    getAccounts() {
        this.dataSource.data = [];
        if (this.catalogSelected) {
            this.isLoadingAccount = true;
            this.dataSource.data = [];
            this.accountingService.getAccounts(this.catalogSelected.key).subscribe({
                next: (dataResult: AccountDTO[]) => {
                    const TREE_DATA: AccountNode[] = [];
                    for (let i = 0; i < dataResult.length; i++) {
                        const accToOrder = dataResult[i];
                        if (!accToOrder.parent) { TREE_DATA.push({ account: accToOrder }) }
                        else {
                            this.searchParentNode(accToOrder, TREE_DATA);
                        }
                    }
                    this.dataSource.data = TREE_DATA;
                    this.isLoadingAccount = false;
                },
                error: () => {
                    this.isLoadingAccount = false;
                },
            });
        } 
    }

    private searchParentNode(_account: AccountDTO, _tree: AccountNode[]) {
        if (!_account.parent) { return; }
        for (let i = _tree.length - 1; i >= 0; i--) {
            const node = _tree[i];
            if (node.account.key === _account.parent) {
                if (!node.children) { node.children = []; }
                node.children.push({ account: _account });
                return;
            }
            if (node.children) { this.searchParentNode(_account, node.children); }
        }
    }

    openAccountForm(selectedAccount: AccountFlatNode = null): void {
        if (!this.catalogSelected) { return; }
        const dialogRef = this._matDialog.open(AccountFormComponent, {
            data: { catalogId: this.catalogSelected.key, parentId: (selectedAccount) ? selectedAccount.key : null }
        });
        dialogRef.afterClosed().subscribe(() => this.getAccounts());
    }

    openUploadForm(): void {
        if (!this.catalogSelected) { return; }
        const dialogRef = this._matDialog.open(UploadFormComponent, {
            disableClose: true,
            data: { catalogId: this.catalogSelected.key }
        });
        dialogRef.afterClosed().subscribe(() => this.getAccounts());
    }
}
