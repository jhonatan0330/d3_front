import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    inject,
    signal
} from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';

import { catchError, map, of, switchMap } from 'rxjs';

import { TenantPublicDTO } from 'app/multitenancy/domain/multitenancy.types';
import { MultitenancyApi } from 'app/multitenancy/multitenancy.api';
import { LoginService } from 'app/authentication/login.service';
import { SignInSplitScreenReversedComponent } from 'app/authentication/components/sign-in/sign-in.component';
import { DropdownComponent } from 'app/shared/components/dropdown/dropdown/dropdown.component';
import { DropdownItemComponent } from 'app/shared/components/dropdown/dropdown-item/dropdown-item.component';
import { TenantUrlService } from 'app/multitenancy/business/tenant-url.service';
import {
    LocalConstants,
    LocalStoreService
} from 'app/shared/local-store.service';
import { Router } from '@angular/router';

@Component({
    selector: 'tenant-switcher',
    templateUrl: './tenant-switcher.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'tenantSwitcher',
    imports: [
        MatIcon,
        DropdownComponent,
        DropdownItemComponent
    ]
})
export class TenantSwitcherComponent {

    private readonly ls = inject(LocalStoreService);
    private readonly loginService = inject(LoginService);
    private readonly multitenancyApi = inject(MultitenancyApi);
    private readonly destroyRef = inject(DestroyRef);
    private readonly dialog = inject(MatDialog);
    private readonly tenantUrlService = inject(TenantUrlService);
    private readonly router = inject(Router);

    readonly tenants = signal<TenantPublicDTO[]>([]);

    readonly currentTenantId = signal<string>(
        this.getSelectedTenant() ?? ''
    );

    readonly currentTenantName = signal<string>(
        this.getSelectedTenantName() ?? 'Tenant'
    );

    constructor() {
        this.loadTenants();
    }

    private loadTenants(): void {
        this.multitenancyApi.listarTenants()
            .pipe(
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe({
                next: tenants => {
                    this.tenants.set(tenants);
                },
                error: () => {
                    this.tenants.set([]);
                }
            });
    }

    selectTenant(tenant: TenantPublicDTO): void {
        if (tenant.key === this.currentTenantId()) {
            return;
        }

        this.switchTenant(tenant)
            .pipe(
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(success => {
                if (!success) {
                    return;
                }

                this.refreshCurrentTenant();
            });
    }

    private refreshCurrentTenant(): void {
        this.currentTenantId.set(
            this.getSelectedTenant() ?? ''
        );

        this.currentTenantName.set(
            this.getSelectedTenantName() ?? 'Tenant'
        );
    }

    private getSelectedTenant(): string | null {
        return this.ls.getItem(LocalConstants.TENANT_ID);
    }

    private getSelectedTenantName(): string | null {
        return this.ls.getItem(LocalConstants.TENANT_NAME);
    }

    private setSelectedTenant(tenant: TenantPublicDTO): void {
        this.ls.setItem(
            LocalConstants.TENANT_ID,
            tenant.key
        );

        this.ls.setItem(
            LocalConstants.TENANT_NAME,
            tenant.name
        );

        this.tenantUrlService.setPrefix(tenant.key);

        this.currentTenantId.set(tenant.key);
        this.currentTenantName.set(tenant.name);
    }

    private tenantTokensKey(): string {
        const login = this.ls.getItem(LocalConstants.LOGIN_ID);

        return (
            LocalConstants.TENANT_TOKENS_BASE +
            (login || 'ANON')
        );
    }

    private getTenantTokens(): Record<string, string> {
        const tokens = this.ls.getItem(
            this.tenantTokensKey()
        );

        return tokens && typeof tokens === 'object'
            ? tokens
            : {};
    }

    private dropTenantToken(tenantKey: string): void {
        const tokens = this.getTenantTokens();

        if (!(tenantKey in tokens)) {
            return;
        }

        delete tokens[tenantKey];

        this.ls.setItem(
            this.tenantTokensKey(),
            tokens
        );
    }

    switchTenant(tenant: TenantPublicDTO) {
        const currentTenantId = this.getSelectedTenant();

        if (tenant.key === currentTenantId) {
            return of(true);
        }

        const returnTo = this.router.url || '/main';

        const previousTenant = {
            id: currentTenantId,
            name: this.getSelectedTenantName(),
            token: this.ls.getItem(LocalConstants.JWT_TOKEN)
        };

        const cachedToken = this.getTenantTokens()[tenant.key];

        this.setSelectedTenant(tenant);

        if (!cachedToken) {
            this.ls.setItem(
                LocalConstants.JWT_TOKEN,
                null
            );

            return this.openLoginDialog(
                returnTo,
                previousTenant
            );
        }

        this.ls.setItem(
            LocalConstants.JWT_TOKEN,
            cachedToken
        );

        return this.loginService
            .checkTokenIsValid(true, false)
            .pipe(
                switchMap(valid => {
                    if (!valid) {
                        this.dropTenantToken(tenant.key);

                        this.ls.setItem(
                            LocalConstants.JWT_TOKEN,
                            null
                        );

                        return this.openLoginDialog(
                            returnTo,
                            previousTenant
                        );
                    }

                    return this.router
                        .navigateByUrl(returnTo)
                        .then(() => true);
                }),
                catchError(() =>
                    this.openLoginDialog(
                        returnTo,
                        previousTenant
                    )
                )
            );
    }

    private openLoginDialog(
        returnTo: string,
        previousTenant: {
            id: string | null;
            name: string | null;
            token: string | null;
        }
    ) {
        return this.dialog
            .open(SignInSplitScreenReversedComponent, {
                width: 'min(28rem, calc(100vw - 2rem))',
                maxWidth: '100vw',
                data: {
                    redirectURL: returnTo,
                    isDialog: true
                }
            })
            .afterClosed()
            .pipe(
                map((authenticated: boolean) => {

                    if (authenticated) {
                        this.refreshCurrentTenant();
                        return true;
                    }

                    this.restoreTenant(previousTenant);

                    return false;
                })
            );
    }

    private restoreTenant(previousTenant: {
        id: string | null;
        name: string | null;
        token: string | null;
    }): void {

        this.ls.setItem(
            LocalConstants.TENANT_ID,
            previousTenant.id
        );

        this.ls.setItem(
            LocalConstants.TENANT_NAME,
            previousTenant.name
        );

        this.ls.setItem(
            LocalConstants.JWT_TOKEN,
            previousTenant.token
        );

        if (previousTenant.id) {
            this.tenantUrlService.setPrefix(
                previousTenant.id
            );
        }

        this.refreshCurrentTenant();
    }
}
