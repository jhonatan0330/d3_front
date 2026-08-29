import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, inject, signal, viewChild, ElementRef, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { AccountDTO, CatalogDTO, ManualDTO, ResultMapDTO } from './accounting.domain';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccountingService } from './accounting.service';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatFooterCellDef, MatFooterCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatFooterRowDef, MatFooterRow } from '@angular/material/table';
import Swal from 'sweetalert2';
import { UtilsService } from 'app/document/service/utils.service';
import { LoginService } from 'app/authentication/login.service';
import { Router } from '@angular/router';
import { MatFormField, MatPrefix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { NgClass, UpperCasePipe, DecimalPipe, DatePipe } from '@angular/common';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { DropdownComponent } from 'app/shared/components/dropdown/dropdown.component';
import { DropdownItemComponent } from 'app/shared/components/dropdown/dropdown-item.component';

interface AccountNode {
    account: AccountDTO;
    children?: AccountNode[];
}

interface AccountFlatNode {
    expandable: boolean;
    name: string;
    code: string;
    wbs: string;
    status: string;
    level: number;
    key: string;
}

@Component({
    selector: 'accounting',
    templateUrl: './accounting.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatFormField,MatIcon,MatPrefix,MatInput,FormsModule,ReactiveFormsModule,NgClass,MatTable,MatSort,MatColumnDef,MatHeaderCellDef,MatHeaderCell,MatSortHeader,MatCellDef,MatCell,MatFooterCellDef,MatFooterCell,MatHeaderRowDef,MatHeaderRow,MatRowDef,MatRow,MatFooterRowDef,MatFooterRow,UpperCasePipe,DecimalPipe,DatePipe,DropdownComponent,DropdownItemComponent]
})
export class AccountComponent implements OnInit, OnDestroy {
    private utilsService = inject(UtilsService);
    accountingService = inject(AccountingService);
    private _jwt = inject(LoginService);
    private _router = inject(Router);
    private destroyRef = inject(DestroyRef);

    readonly drawer = viewChild<ElementRef>('drawer');

    drawerOpened = signal(true);
    drawerMode: 'over' | 'side' = 'over';
    private _mediaQuery = window.matchMedia('(min-width: 960px)');
    private _mediaHandler = (e: MediaQueryListEvent) => {
        this.drawerMode = e.matches ? 'side' : 'over';
    };

    catalogs: CatalogDTO[];
    searchInputControl: FormControl<string | null> = new FormControl<string | null>(null);
    isLoadingCatalog = false;
    isLoadingAccount = false;
    isLoadingBalance = false;
    isLoadingVoucher = false;

    recentTransactionsDataSource: MatTableDataSource<ManualDTO> = new MatTableDataSource();
    recentTransactionsTableColumns: string[] = ['transactionId', 'date', 'name', 'amount', 'status', 'actions'];

    balance: ResultMapDTO[];

    private transformer = (node: AccountNode, level: number): AccountFlatNode => {
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
        this.drawerMode = this._mediaQuery.matches ? 'side' : 'over';
        this._mediaQuery.addEventListener('change', this._mediaHandler);
        this.getCatalogs();
        this.accountingService.currentCatalog = null!;
    }

    toggleDrawer(): void {
        this.drawerOpened.update((v) => !v);
    }

    openDrawer(): void {
        this.drawerOpened.set(true);
    }

    closeDrawer(): void {
        this.drawerOpened.set(false);
    }

    ngOnDestroy(): void {
        this._mediaQuery.removeEventListener('change', this._mediaHandler);
    }


    getVouchers() {
        this.isLoadingVoucher = true;
        this.accountingService.getVouchers(this.accountingService.currentCatalog.key)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
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
            .pipe(takeUntilDestroyed(this.destroyRef))
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
                this.accountingService.deleteVoucher(voucher.key)
                    .pipe(takeUntilDestroyed(this.destroyRef))
                    .subscribe({
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
        this.accountingService.getCatalogs()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
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
        this.drawerOpened.set(false);
        this.getAccounts();
        this.getBalance();
        this.getVouchers();
    }

    getBalance() {
        this.balance = [];
        if (this.accountingService.currentCatalog) {
            this.isLoadingBalance = true;
            this.accountingService.getBalance(this.accountingService.currentCatalog.key)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe({
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
            this.accountingService.getAccounts(this.accountingService.currentCatalog.key)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe({
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


    trackByFn(index: number, item: any): any {
        return item.key || index;
    }

    openManualForm(): void {
        if (!this.accountingService.currentCatalog) { return; }
        this.utilsService.modalVoucher(null!, this.accountingService.currentCatalog.key)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => { this.getBalance(); this.getVouchers(); });
    }
}
