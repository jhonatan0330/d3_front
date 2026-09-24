import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    effect,
    inject,
    signal
} from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';
import { Observable, catchError, from, map, switchMap } from 'rxjs';
import { TenantPublicDTO } from 'app/multitenancy/domain/TenantPublicDTO';
import { TenantRuntime } from 'app/multitenancy/business/tenant-runtime';
import { prefixForTenant, stripTenantPrefix } from 'app/multitenancy/business/tenant-url.strategy';
import { TenantUrlService } from 'app/multitenancy/business/tenant-url.service';
import { MultitenancyApi } from 'app/multitenancy/multitenancy.api';
import { LoginService } from 'app/authentication/login.service';
import { LayoutService } from 'app/layout/layout.service';
import { DropdownComponent } from 'app/shared/components/dropdown/dropdown/dropdown.component';
import { DropdownItemComponent } from 'app/shared/components/dropdown/dropdown-item/dropdown-item.component';
import { LocalStoreService } from 'app/shared/local-store.service';
import { ImageFormatPipe } from 'app/shared/local-image';

@Component({
    selector: 'tenant-switcher',
    templateUrl: './tenant-switcher.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'tenantSwitcher',
    imports: [ MatIcon, DropdownComponent, DropdownItemComponent, ImageFormatPipe ]
})
export class TenantSwitcherComponent {

    private readonly ls = inject(LocalStoreService);
    private readonly loginService = inject(LoginService);
    private readonly layoutService = inject(LayoutService);
    private readonly multitenancyApi = inject(MultitenancyApi);
    private readonly tenantUrl = inject(TenantUrlService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly router = inject(Router);

    readonly tenants = this.tenantUrl.tenants;
    readonly currentTenant = signal<TenantRuntime | null>(
        TenantRuntime.getCurrent()
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
                    this.tenantUrl.syncTenants(tenants);
                    this.syncRuntime(tenants);
                },
                error: () => {
                    this.syncRuntime(this.tenants());
                }
            });
    }

    private syncRuntime(tenants: TenantPublicDTO[]): void {
        const cached = this.ls.getTenants();
        for (const stored of cached) {
            if (stored?.key && !TenantRuntime.findByKey(stored.key)) {
                TenantRuntime.upsert({ ...stored });
            }
        }
        for (const tenant of tenants) {
            const existing = TenantRuntime.findByKey(tenant.key);
            if (existing) {
                existing.name = tenant.name;
                existing.imagen = tenant.imagen;
                continue;
            }
            TenantRuntime.upsert({
                ...tenant,
                token: cached.find(item => item.key === tenant.key)?.token ?? null
            });
        }
        this.ls.setTenants(TenantRuntime.getTenants());
    }

    selectTenant(tenant: TenantPublicDTO): void {
        if (tenant.key === this.currentTenant()?.key) {
            return;
        }

        this.switchTenant(tenant)
            .pipe(
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe();
    }

    switchTenant(tenant: TenantPublicDTO): Observable<boolean> {
        const previous = TenantRuntime.getCurrent();
        let target = TenantRuntime.findByKey(tenant.key);
        if (!target) {
            target = { ...tenant, token: null };
            TenantRuntime.upsert(target);
        }

        TenantRuntime.setCurrent(target);
        this.currentTenant.set(target);
        this.tenantUrl.setPrefix(prefixForTenant(target));
        this.ls.setTenants(TenantRuntime.getTenants());

        const returnTo = this.resolveReturnUrl();
        const loginQueryParams = {
            pendingSwitch: '1',
            tenant: target.key,
            previous: previous?.key ?? '',
            redirectURL: returnTo
        };
        const goToLogin = (): Observable<boolean> =>
            from(this.router.navigate(['/sign-in'], { queryParams: loginQueryParams }))
                .pipe(map(() => false));

        if (!target.token) {
            return goToLogin();
        }

        return this.loginService
            .checkTokenIsValid(true)
            .pipe(
                switchMap(valid => {
                    if (!valid) {
                        return goToLogin();
                    }
                    this.layoutService.getOrganization();
                    return from(this.router.navigateByUrl(returnTo))
                        .pipe(map(() => true));
                }),
                catchError(() => goToLogin())
            );
    }

    private resolveReturnUrl(): string {
        const url = stripTenantPrefix(
            this.router.url ?? '',
            this.tenantUrl.tenants(),
            this.tenantUrl.prefix
        );
        if (!url || url.startsWith('/sign-in')) {
            return '/main';
        }
        return url;
    }
}
