import { Injectable } from '@angular/core';
import { TenantRuntime } from 'app/multitenancy/business/tenant-runtime';
import { TenantPublicDTO } from 'app/multitenancy/domain/TenantPublicDTO';

export const LocalConstants = {
  URL_CONF: 'URL_CONF',
  TENANTS: 'D3_TENANTS_CACHE'
};

@Injectable({
  providedIn: 'root'
})
export class LocalStoreService {

  private ls = window.localStorage;

  private setItem(key: string, value: any) {
    value = JSON.stringify(value);
    this.ls.setItem(key, value);
    return true
  }

  private getItem(key: string) {
    const value = this.ls.getItem(key);
    try {
      return JSON.parse(value!);
    } catch (e) {
      return null;
    }
  }

  public clear() {
    this.ls.clear();
  }

  public getUrlAccess(endpoint: string): string {
    if (!endpoint.startsWith('/')) {
      endpoint = '/' + endpoint;
    }
    const url: string | null = this.getItem(LocalConstants.URL_CONF);
    const result = url!.concat(endpoint.toString());
    return result;
  }

  public setUrlConf(url: string | null) {
     this.setItem(LocalConstants.URL_CONF, url);
  }

  public getUrlConf(): string | null {
    return this.getItem(LocalConstants.URL_CONF);
  }

  public setTenants(tenants: TenantRuntime[]) {
    this.setItem(LocalConstants.TENANTS, tenants);
  }

  public getTenants(): TenantRuntime[] {
    const value = this.getItem(LocalConstants.TENANTS);
    return Array.isArray(value) ? value as TenantRuntime[] : [];
  }
}
