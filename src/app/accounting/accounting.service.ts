import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AccountDTO, CatalogDTO } from './accounting.domain';
import { LocalStoreService } from 'app/shared/local-store.service';

@Injectable({ providedIn: 'root' })
export class AccountingService {

    constructor(private http: HttpClient,
        private ls: LocalStoreService) {
    }

    getCatalogs(): Observable<CatalogDTO[]> {
        return this.http.get<CatalogDTO[]>(this.ls.getUrlAccess('/acc/plan/catalog'));
    }

    createCatalog(catalog: CatalogDTO): Observable<CatalogDTO> {
        return this.http.post<CatalogDTO>(this.ls.getUrlAccess('/acc/plan/catalog'), catalog);
    }

    getCatalog(key: string): Observable<CatalogDTO> {
        return this.http.get<CatalogDTO>(this.ls.getUrlAccess('/acc/plan/catalog/' + key));
    }
    
    getAccounts(catalogId: string): Observable<AccountDTO[]> {
        return this.http.get<AccountDTO[]>(this.ls.getUrlAccess('/acc/plan/account/' + catalogId));
    }

}
