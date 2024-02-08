import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { Subject, takeUntil } from 'rxjs';
import { CatalogFormComponent } from './catalog-form/catalog-form.component';
import { MatDialog } from '@angular/material/dialog';
import { AccountDTO, CatalogDTO, ManualDTO, ResultMapDTO } from './accounting.domain';
import { UntypedFormControl } from '@angular/forms';
import { AccountingService } from './accounting.service';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { AccountFormComponent } from './account-form/account-form.component';
import { UploadFormComponent } from './upload/upload-form.component';
import { ManualFormComponent } from './manual-form/manual-form.component';
import { MatTableDataSource } from '@angular/material/table';

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
    searchInputControl: UntypedFormControl = new UntypedFormControl();
    isLoadingCatalog = false;
    isLoadingAccount = false;
    isLoadingBalance = false;
    isLoadingVoucher = false;

    recentTransactionsDataSource: MatTableDataSource<ManualDTO> = new MatTableDataSource();
    recentTransactionsTableColumns: string[] = ['transactionId', 'date', 'name', 'amount', 'status'];

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
        public accountingService: AccountingService) {
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
        this.accountingService.currentCatalog = null;
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

    getVouchers() {
        this.isLoadingVoucher = true;
        this.accountingService.getVouchers(this.accountingService.currentCatalog.key).subscribe({
            next: (dataResult: ManualDTO[]) => {
                this.recentTransactionsDataSource.data = dataResult;
                this.isLoadingVoucher = false;
            },
            error: () => {
                this.isLoadingVoucher = false;
            },
        });
    }

    getCatalogs() {
        this.isLoadingCatalog = true;
        this.accountingService.getCatalogs().subscribe({
            next: (dataResult: CatalogDTO[]) => {
                this.catalogs = dataResult;
                this.isLoadingCatalog = false;
                if (this.catalogs.length === 1) { this.selectCatalog(this.catalogs[0]); }
            },
            error: () => {
                this.isLoadingCatalog = false;
            },
        });
    }

    selectCatalog(catalog: CatalogDTO) {
        if (catalog && this.accountingService.currentCatalog && catalog.key === this.accountingService.currentCatalog.key) {
            return;
        }
        this.accountingService.currentCatalog = catalog;
        this.drawer.close();
        this.getAccounts();
        this.getBalance();
        this.getVouchers();
    }

    getBalance() {
        this.balance = [];
        if (this.accountingService.currentCatalog) {
            this.isLoadingBalance = true;
            this.accountingService.getBalance(this.accountingService.currentCatalog.key).subscribe({
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
        if (this.accountingService.currentCatalog) {
            this.isLoadingAccount = true;
            this.dataSource.data = [];
            this.accountingService.getAccounts(this.accountingService.currentCatalog.key).subscribe({
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
        if (!this.accountingService.currentCatalog) { return; }
        const dialogRef = this._matDialog.open(AccountFormComponent, {
            data: { catalogId: this.accountingService.currentCatalog.key, parentId: (selectedAccount) ? selectedAccount.key : null },
            disableClose: true, 
        });
        dialogRef.afterClosed().subscribe(() => this.getAccounts());
    }

    openManualForm(): void {
        if (!this.accountingService.currentCatalog) { return; }
        const dialogRef = this._matDialog.open(ManualFormComponent, {
            data: { catalogId: this.accountingService.currentCatalog.key },
            maxHeight: '90vh',
            disableClose: true,
        });
        dialogRef.afterClosed().subscribe(() => { this.getBalance(); this.getVouchers(); });
    }


    openUploadForm(): void {
        if (!this.accountingService.currentCatalog) { return; }
        const dialogRef = this._matDialog.open(UploadFormComponent, {
            disableClose: true,
            data: { catalogId: this.accountingService.currentCatalog.key }
        });
        dialogRef.afterClosed().subscribe(() => this.getAccounts());
    }
}
