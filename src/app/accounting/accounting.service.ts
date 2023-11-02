import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CatalogDTO } from './accounting.domain';
import { LocalStoreService } from 'app/shared/local-store.service';

@Injectable({ providedIn: 'root' })
export class MailboxService {
    //selectedMailChanged: BehaviorSubject<any> = new BehaviorSubject(null);

    //private _catalogs: BehaviorSubject<CatalogDTO[]> = new BehaviorSubject(null);
    //private _mailsLoading: BehaviorSubject<boolean> = new BehaviorSubject(false);
    //private _mail: BehaviorSubject<Mail> = new BehaviorSubject(null);

    constructor(private http: HttpClient,
        private ls: LocalStoreService) {
    }

    /*get catalogs$(): Observable<CatalogDTO[]> {
        return this._catalogs.asObservable();
    }*/

    getCatalogs(): Observable<CatalogDTO[]> {
        return this.http.get<CatalogDTO[]>(this.ls.getUrlAccess('/template/getTemplates'));
    }

    createCatalog(catalog: CatalogDTO): Observable<CatalogDTO> {
        return this.http.post<CatalogDTO>(this.ls.getUrlAccess('/rest/changeState'), catalog);
    }


}
