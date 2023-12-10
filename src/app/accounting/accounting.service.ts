import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AccountDTO, CatalogDTO, ManualDTO, ResultMapDTO, Voucher } from './accounting.domain';
import { LocalStoreService } from 'app/shared/local-store.service';

@Injectable({ providedIn: 'root' })
export class AccountingService {

    public currentCatalog: CatalogDTO;

    constructor(private http: HttpClient,
        private ls: LocalStoreService) {
    }

    getVouchers(catalogId: string): Observable<ManualDTO[]> {
        return this.http.get<ManualDTO[]>(this.ls.getUrlAccess('/acc/voucher/' + catalogId));
    }

    createManual(manual: Voucher): Observable<ManualDTO> {
        return this.http.post<ManualDTO>(this.ls.getUrlAccess('/acc/voucher/manual'), manual);
    }

    upload(catalogId: string, formData: FormData): Observable<void> {
        return this.http.post<void>(this.ls.getUrlAccess('/acc/plan/upload/' + catalogId ), formData);
    }

    getBalance(catalogId: string): Observable<ResultMapDTO[]> {
        return this.http.get<ResultMapDTO[]>(this.ls.getUrlAccess('/acc/plan/balance/' + catalogId ));
    }

    getAccounts(catalogId: string, nameFilter: string = null): Observable<AccountDTO[]> {
        let params = '';
        if (nameFilter) { params = params + 'filter=' + nameFilter; }
        if (params.length!==0) params = '?' + params;
        return this.http.get<AccountDTO[]>(this.ls.getUrlAccess('/acc/plan/account/' + catalogId + params));
    }

    createAccount(account: AccountDTO): Observable<AccountDTO> {
        return this.http.post<AccountDTO>(this.ls.getUrlAccess('/acc/plan/account'), account);
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


}
