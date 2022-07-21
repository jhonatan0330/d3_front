import { Injectable } from '@angular/core';

export const LocalConstants = {
  JWT_TOKEN: 'JWT_TOKEN',
  APP_USER: 'EGRET_USER',
  TEMPLATES: 'SW42_TEMPLATES',
  URL_CONF: 'URL_CONF'
};

@Injectable({
  providedIn: 'root'
})
export class LocalStoreService {

  private ls = window.localStorage;

  constructor() { }

  public setItem(key: string , value: any) {
    value = JSON.stringify(value);
    this.ls.setItem(key, value);
    return true
  }

  public getItem(key: string) {
    const value = this.ls.getItem(key);
    try {
      return JSON.parse(value);
    } catch (e) {
      return null;
    }
  }

  public clear() {
    this.ls.clear();
  }

  getUrlAccess(endpoint: string, serverUrl: string  = null): string {
    if (!endpoint.startsWith('/')) {
      endpoint = '/' + endpoint;
    }
    let url: String = serverUrl;
    if(!url){
       url = this.getItem(LocalConstants.URL_CONF);
    }
    const result = url.concat(endpoint.toString());
    return result;
    // return 'http://localhost:8080/sw42/' +  endpoint;
  }
}
