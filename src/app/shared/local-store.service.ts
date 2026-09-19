import { Injectable } from '@angular/core';

export const LocalConstants = {
  JWT_TOKEN: 'JWT_TOKEN',
  PUBLIC_TOKEN: 'PUBLIC_TOKEN',
  APP_USER: 'EGRET_USER',
  TEMPLATES: 'D3_TEMPLATES',
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

  constructor(

  ) { }

  public setItem(key: string , value: any) {
    value = JSON.stringify(value);
    this.ls.setItem(key, value);
    return true
  }

  public getItem(key: string) {
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

  getUrlAccess(endpoint: string): string {
    if (!endpoint.startsWith('/')) {
      endpoint = '/' + endpoint;
    }
    const url: string | null = this.getItem(LocalConstants.URL_CONF);
    const result = url!.concat(endpoint.toString());
    return result;
  }
}
