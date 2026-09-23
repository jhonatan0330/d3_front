import { TenantPublicDTO } from 'app/multitenancy/domain/TenantPublicDTO';

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
    setCurrent(tenant: TenantRuntime | null): void {
        if(!tenant){
            currentTenant = tenants.get('default')?? null;
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
    }
};