import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIcon } from '@angular/material/icon';
import { TenantPublicDTO } from 'app/multitenancy/domain/multitenancy.types';
import { MultitenancyApi } from 'app/multitenancy/multitenancy.api';
import { LoginService } from 'app/authentication/login.service';
import { DropdownComponent } from 'app/shared/components/dropdown/dropdown/dropdown.component';
import { DropdownItemComponent } from 'app/shared/components/dropdown/dropdown-item/dropdown-item.component';

@Component({
    selector: 'tenant-switcher',
    templateUrl: './tenant-switcher.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'tenantSwitcher',
    imports: [MatIcon, DropdownComponent, DropdownItemComponent]
})
export class TenantSwitcherComponent {
    private _loginService = inject(LoginService);
    private _multitenancyApi = inject(MultitenancyApi);
    private _cdr = inject(ChangeDetectorRef);
    private _destroyRef = inject(DestroyRef);

    tenants: TenantPublicDTO[] = [];
    currentTenantId: string = this._loginService.getSelectedTenant();
    currentTenantName: string = this._loginService.getSelectedTenantName() || 'Tenant';

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
        this._loginService.switchTenant(tenant)
            .pipe(takeUntilDestroyed(this._destroyRef))
            .subscribe(() => {
                this.currentTenantId = this._loginService.getSelectedTenant();
                this.currentTenantName = this._loginService.getSelectedTenantName() || 'Tenant';
                this._cdr.markForCheck();
            });
    }
}