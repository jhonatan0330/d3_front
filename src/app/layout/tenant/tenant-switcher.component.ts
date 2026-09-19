import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { TenantPublicDTO } from 'app/multitenancy/domain/multitenancy.types';
import { MultitenancyApi } from 'app/multitenancy/multitenancy.api';
import { LoginService } from 'app/authentication/login.service';
import { SignInSplitScreenReversedComponent } from 'app/authentication/sign-in/sign-in.component';
import { DropdownComponent } from 'app/shared/components/dropdown/dropdown/dropdown.component';
import { DropdownItemComponent } from 'app/shared/components/dropdown/dropdown-item/dropdown-item.component';
import { TenantUrlService } from 'app/multitenancy/business/tenant-url.service';
import { LocalConstants, LocalStoreService } from 'app/shared/local-store.service';
import { catchError, map, of, switchMap } from 'rxjs';
import { Router } from '@angular/router';

@Component({
    selector: 'tenant-switcher',
    templateUrl: './tenant-switcher.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'tenantSwitcher',
    imports: [MatIcon, DropdownComponent, DropdownItemComponent]
})
export class TenantSwitcherComponent {
    private ls = inject(LocalStoreService);
    private _loginService = inject(LoginService);
    private _multitenancyApi = inject(MultitenancyApi);
    private _cdr = inject(ChangeDetectorRef);
    private _destroyRef = inject(DestroyRef);
    private dialog = inject(MatDialog);
    private tenantUrlService = inject(TenantUrlService);
    private router = inject(Router);

    tenants: TenantPublicDTO[] = [];
    currentTenantId: string = this.getSelectedTenant();
    currentTenantName: string = this.getSelectedTenantName() || 'Tenant';

    constructor() {
        this._multitenancyApi.listarTenants()
            .pipe(takeUntilDestroyed(this._destroyRef))
            .subscribe({
                next: (tenants) => {
                    this.tenants = tenants;
                    this._cdr.markForCheck();
                },
                error: () => {
                    this._cdr.markForCheck();
                }
            });
    }

    selectTenant(tenant: TenantPublicDTO): void {
        if (tenant.key === this.currentTenantId) {
            return;
        }
        this.switchTenant(tenant)
            .pipe(takeUntilDestroyed(this._destroyRef))
            .subscribe(() => {
                this.currentTenantId = this.getSelectedTenant();
                this.currentTenantName = this.getSelectedTenantName() || 'Tenant';
                this._cdr.markForCheck();
            });
    }

    getSelectedTenant(): string {
        return this.ls.getItem(LocalConstants.TENANT_ID);
    }

    getSelectedTenantName(): string {
        return this.ls.getItem(LocalConstants.TENANT_NAME);
    }

    setSelectedTenant(tenant: TenantPublicDTO) {
        this.ls.setItem(LocalConstants.TENANT_ID, tenant.key);
        this.ls.setItem(LocalConstants.TENANT_NAME, tenant.name);
        this.tenantUrlService.setPrefix(tenant.key);
    }
    //Estos 2 metodos estan duplicados en login y en tenant despues los ajusto
    private tenantTokensKey(): string {
        const login = this.ls.getItem(LocalConstants.LOGIN_ID);
        return LocalConstants.TENANT_TOKENS_BASE + (login || 'ANON');
    }
    //Estos 2 metodos estan duplicados en login y en tenant despues los ajusto
    private getTenantTokens(): { [key: string]: string } {
        const tokens = this.ls.getItem(this.tenantTokensKey());
        return tokens && typeof tokens === 'object' ? tokens : {};
    }

    private dropTenantToken(tenantKey: string) {
        const tokens = this.getTenantTokens();
        if (tenantKey in tokens) {
            delete tokens[tenantKey];
            this.ls.setItem(this.tenantTokensKey(), tokens);
        }
    }

    switchTenant(tenant: TenantPublicDTO) {
        if (tenant.key === this.getSelectedTenant()) {
            return of(true);
        }
        const returnTo = this.router.url || '/main';
        const previousTenant = {
            id: this.getSelectedTenant(),
            name: this.getSelectedTenantName(),
            token: this.ls.getItem(LocalConstants.JWT_TOKEN)
        };
        const cachedToken = this.getTenantTokens()[tenant.key];
        this.setSelectedTenant(tenant);
        if (!cachedToken) {
            this.ls.setItem(LocalConstants.JWT_TOKEN, null);
            return this.openLoginDialog(returnTo, previousTenant);
        }
        this.ls.setItem(LocalConstants.JWT_TOKEN, cachedToken);
        return this._loginService.checkTokenIsValid(true, false).pipe(
            takeUntilDestroyed(this._destroyRef),
            switchMap((result: boolean) => {
                if (!result) {
                    this.dropTenantToken(tenant.key);
                    this.ls.setItem(LocalConstants.JWT_TOKEN, null);
                    return this.openLoginDialog(returnTo, previousTenant);
                }
                this.router.navigateByUrl(returnTo);
                return of(true);
            }),
            catchError(() => {
                return this.openLoginDialog(returnTo, previousTenant);
            })
        );
    }

    private openLoginDialog(returnTo: string, previousTenant: { id: string; name: string; token: string }) {
        return this.dialog.open(SignInSplitScreenReversedComponent, {
            width: 'min(28rem, calc(100vw - 2rem))',
            maxWidth: '100vw',
            data: { redirectURL: returnTo, isDialog: true }
        }).afterClosed().pipe(
            map((authenticated: boolean) => {
                if (authenticated) {
                    this.router.navigateByUrl(returnTo);
                    return true;
                }
                this.ls.setItem(LocalConstants.TENANT_ID, previousTenant.id);
                this.ls.setItem(LocalConstants.TENANT_NAME, previousTenant.name);
                this.tenantUrlService.setPrefix(previousTenant.id);
                this.ls.setItem(LocalConstants.JWT_TOKEN, previousTenant.token);
                return false;
            })
        );
    }

}