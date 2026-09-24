import { TenantPublicDTO } from 'app/multitenancy/domain/TenantPublicDTO';
import { isDefaultTenant } from 'app/multitenancy/business/tenant-url.strategy';

export interface TenantRuntime extends TenantPublicDTO {
    token: string | null;
}
const tenants = new Map<string, TenantRuntime>();
let currentTenant: TenantRuntime | null = null;

export const TenantRuntime = {
    getTenants(): TenantRuntime[] {
        return [...tenants.values()];
    },
    setTenants(list: TenantRuntime[]): void {
        tenants.clear();
        for (const tenant of list) {
            tenants.set(tenant.key, tenant);
        }
    },
    findByKey(key: string): TenantRuntime | undefined {
        return tenants.get(key);
    },
    upsert(tenant: TenantRuntime): void {
        tenants.set(tenant.key, tenant);
    },
    setCurrent(tenant: TenantRuntime | null): void {
        if(!tenant){
            currentTenant = tenants.get('default')
                ?? [...tenants.values()].find(isDefaultTenant)
                ?? null;
        }else{
            currentTenant = tenant;
        }
    },
    getCurrent(): TenantRuntime | null {
        return currentTenant;
    },
    setToken(key: string, token: string): void {
        const tenant = tenants.get(key);
        if (tenant) {
            tenant.token = token;
        }
        if (currentTenant && currentTenant.key === key) {
            currentTenant.token = token;
        }
    },
    clearToken(key: string): void {
        const tenant = tenants.get(key);
        if (tenant) {
            tenant.token = null;
        }
        if (currentTenant && currentTenant.key === key) {
            currentTenant.token = null;
        }
    }
};