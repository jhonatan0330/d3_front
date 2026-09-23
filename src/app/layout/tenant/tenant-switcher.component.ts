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
import { TenantPublicDTO } from 'app/multitenancy/domain/TenantPublicDTO';
import { TenantRuntime } from 'app/multitenancy/business/tenant-runtime';
import { MultitenancyApi } from 'app/multitenancy/multitenancy.api';
import { LoginService } from 'app/authentication/login.service';
import { SignInSplitScreenReversedComponent } from 'app/authentication/components/sign-in/sign-in.component';
import { DropdownComponent } from 'app/shared/components/dropdown/dropdown/dropdown.component';
import { DropdownItemComponent } from 'app/shared/components/dropdown/dropdown-item/dropdown-item.component';
import { TenantUrlService } from 'app/multitenancy/business/tenant-url.service';
import { LocalStoreService } from 'app/shared/local-store.service';
import { Router } from '@angular/router';
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
    private readonly multitenancyApi = inject(MultitenancyApi);
    private readonly destroyRef = inject(DestroyRef);
    private readonly dialog = inject(MatDialog);
    private readonly tenantUrlService = inject(TenantUrlService);
    private readonly router = inject(Router);

    readonly tenants = signal<TenantPublicDTO[]>([]);
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
                    this.tenants.set(tenants);
                },
                error: () => {
                    this.tenants.set([]);
                }
            });
    }

    selectTenant(tenant: TenantPublicDTO): void {
        if (tenant.key === this.currentTenant()?.key) {
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
            });
    }


    switchTenant(tenant: TenantPublicDTO) {
        const newTenant = TenantRuntime.findByKey(tenant.key);
        const returnTo ='';
        return this.loginService
            .checkTokenIsValid(true)
            .pipe(
                switchMap(valid => {
                    if (!valid) {                  

                        return this.openLoginDialog(
                            returnTo
                        );
                    }

                    return this.router
                        .navigateByUrl(returnTo)
                        .then(() => true);
                }),
                catchError(() =>
                    this.openLoginDialog(
                        returnTo,
                    )
                )
            );
            
    }

    private openLoginDialog(
        returnTo: string
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
                        return true;
                    }
                    return false;
                })
            );
    }

    
}
