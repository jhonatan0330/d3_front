import { Injectable } from '@angular/core';

export const LocalConstants = {
  JWT_TOKEN: 'JWT_TOKEN',
  URL_CONF: 'URL_CONF',
  TENANT_ID: 'TENANT_ID',
  TENANT_NAME: 'TENANT_NAME',
  LOGIN_ID: 'LOGIN_ID',
  TENANT_TOKENS_BASE: 'D3_TENANT_TOKENS_'
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

  public setTenantId(tenantId: string | null) {
    this.setItem(LocalConstants.TENANT_ID, tenantId);
  }

  public getTenantId(): string | null {
    return this.getItem(LocalConstants.TENANT_ID);
  }

  public setUrlConf(url: string | null) {
     this.setItem(LocalConstants.URL_CONF, url);
  }

  public getUrlConf(): string | null {
    return this.getItem(LocalConstants.URL_CONF);
  }

  public setJwtToken(token: string | null) {
    this.setItem(LocalConstants.JWT_TOKEN, token);
  }

  public getJwtToken(): string | null {
    return this.getItem(LocalConstants.JWT_TOKEN);
  }
}
