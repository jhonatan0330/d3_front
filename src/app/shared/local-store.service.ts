import { Injectable } from '@angular/core';

export const LocalConstants = {
  JWT_TOKEN: 'JWT_TOKEN',
  APP_USER: 'EGRET_USER',
  TEMPLATES: 'SW42_TEMPLATES',
  URL_CONF: 'URL_CONF',
  SERVERS: 'SERVERS'
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
      return JSON.parse(value);
    } catch (e) {
      return null;
    }
  }

  public clear() {
    this.ls.clear();
  }

  getUrlAccess(endpoint: string, server: string  = null): string {
    if (!endpoint.startsWith('/')) {
      endpoint = '/' + endpoint;
    }
    let url: String = this.getUrl4Id( server);
    if(!url){
       url = this.getItem(LocalConstants.URL_CONF);
    }
    const result = url.concat(endpoint.toString());
    return result;
    // return 'http://localhost:8080/sw42/' +  endpoint;
  }

  private getUrl4Id(id: string): string {
    const otherSystems = this.getItem(LocalConstants.SERVERS);
    if (!id || !otherSystems) { return null; }
    const org = otherSystems.find(item => id === item.llaveTabla);
    if (org) {
      return org.servidorUrl;
    }
    return null;
  }
}
