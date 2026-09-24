import { Injectable, signal } from '@angular/core';
import { TenantPublicDTO } from 'app/multitenancy/domain/TenantPublicDTO';

@Injectable({ providedIn: 'root' })
export class TenantUrlService {
    private readonly prefixSignal = signal('');
    private readonly tenantsSignal = signal<TenantPublicDTO[]>([]);

    readonly tenants = this.tenantsSignal.asReadonly();

    get prefix(): string {
        return this.prefixSignal();
    }

    setPrefix(prefix: string): void {
        const value = prefix?.trim() || '';
        if (!value) {
            this.prefixSignal.set('');
            return;
        }
        this.prefixSignal.set('/' + value.replace(/\/+/g, '/').replace(/^\/+|\/+$/g, ''));
    }

    syncTenants(tenants: TenantPublicDTO[]): void {
        if (!tenants?.length) {
            return;
        }
        const merged = new Map(this.tenantsSignal().map(tenant => [tenant.key, tenant]));
        for (const tenant of tenants) {
            if (tenant?.key) {
                merged.set(tenant.key, tenant);
            }
        }
        this.tenantsSignal.set([...merged.values()]);
    }

    findTenantByKey(key: string): TenantPublicDTO | undefined {
        return this.tenantsSignal().find(tenant => tenant.key === key);
    }
}