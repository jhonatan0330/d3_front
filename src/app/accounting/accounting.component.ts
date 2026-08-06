import { Component, OnDestroy, OnInit, ViewEncapsulation, ChangeDetectionStrategy, inject, viewChild } from '@angular/core';
import { MatDrawer, MatDrawerContainer, MatDrawerContent } from '@angular/material/sidenav';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { Subject, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { AccountDTO, CatalogDTO, ManualDTO, ResultMapDTO } from './accounting.domain';
import { UntypedFormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccountingService } from './accounting.service';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatFooterCellDef, MatFooterCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatFooterRowDef, MatFooterRow } from '@angular/material/table';
import Swal from 'sweetalert2';
import { UtilsService } from 'app/modules/full/neuron/service/utils.service';
import { LoginService } from 'app/authentication/login.service';
import { Router } from '@angular/router';
import { MatFormField, MatPrefix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatProgressBar } from '@angular/material/progress-bar';
import { NgClass, UpperCasePipe, DecimalPipe, DatePipe } from '@angular/common';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatSort, MatSortHeader } from '@angular/material/sort';

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
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatDrawerContainer, MatDrawer, MatFormField, MatIcon, MatPrefix, MatInput, FormsModule, ReactiveFormsModule, MatProgressBar, NgClass, MatDrawerContent, MatIconButton, MatMenuTrigger, MatMenu, MatMenuItem, MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatSortHeader, MatCellDef, MatCell, MatFooterCellDef, MatFooterCell, MatButton, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatFooterRowDef, MatFooterRow, UpperCasePipe, DecimalPipe, DatePipe]
})
export class AccountComponent implements OnInit, OnDestroy {
    private _fuseMediaWatcherService = inject(FuseMediaWatcherService);
    private utilsService = inject(UtilsService);
    accountingService = inject(AccountingService);
    private _jwt = inject(LoginService);
    private _router = inject(Router);

    readonly drawer = viewChild<MatDrawer>('drawer');

    drawerMode: 'over' | 'side' = 'over';
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    catalogs: CatalogDTO[];
    searchInputControl: UntypedFormControl = new UntypedFormControl();
    isLoadingCatalog = false;
    isLoadingAccount = false;
    isLoadingBalance = false;
    isLoadingVoucher = false;

    recentTransactionsDataSource: MatTableDataSource<ManualDTO> = new MatTableDataSource();
    recentTransactionsTableColumns: string[] = ['transactionId', 'date', 'name', 'amount', 'status', 'actions'];

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

    displayedColumns: string[] = ['code', 'name', 'status'];

    treeControl = new FlatTreeControl<AccountFlatNode>(
        node => node.level, node => node.expandable);

    treeFlattener = new MatTreeFlattener(
        this.transformer, node => node.level,
        node => node.expandable, node => node.children);

    dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    ngOnInit(): void {
        if (!this._jwt.validateAccessModule('account')) {
            this._router.navigate(['/main']);
            return;
        }
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
        this.drawer().toggle();
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
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

    editVouchers(voucher: ManualDTO) {
        this.utilsService.modalVoucher(voucher.key, voucher.catalog)
            .subscribe(() => {
                this.getAccounts();
            });
    }

    deleteVouchers(voucher: ManualDTO) {

        Swal.fire({
            title: '¿Desea eliminar el comprobante?',
            text: voucher.code,
            icon: "warning",
            confirmButtonColor: '#3085d6',
            confirmButtonText: "Si, eliminar",
            showCancelButton: true,
            cancelButtonColor: '#d33',
            cancelButtonText: 'No, volver'
        }).then((resultado) => {

            if (resultado.isConfirmed) {
                this.accountingService.deleteVoucher(voucher.key).subscribe({
                    next: (dataResult: ManualDTO) => {
                    },
                    error: () => {
                        this.isLoadingCatalog = false;
                    },
                    complete: () => {
                        this.getVouchers();
                    }
                });
            }

        })
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
        this.drawer().close();
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


    openManualForm(): void {
        if (!this.accountingService.currentCatalog) { return; }
        this.utilsService.modalVoucher(null, this.accountingService.currentCatalog.key)
            .subscribe(() => { this.getBalance(); this.getVouchers(); });
    }
}
