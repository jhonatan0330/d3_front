import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AccountDTO, CatalogDTO, ManualDTO, ResultMapDTO, Voucher, Voucher_ } from './accounting.domain';
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

    getVoucher(key: string): Observable<Voucher_> {
        return this.http.get<Voucher_>(this.ls.getUrlAccess('/acc/voucher/one/' + key));
    }

    createManual(voucher: Voucher): Observable<ManualDTO> {
        return this.http.post<ManualDTO>(this.ls.getUrlAccess('/acc/voucher/manual'), voucher);
    }

    updateManual(voucher: Voucher): Observable<ManualDTO> {
        return this.http.put<ManualDTO>(this.ls.getUrlAccess('/acc/voucher/manual'), voucher);
    }

    updateVoucher(voucher: ManualDTO): Observable<ManualDTO> {
        return this.http.put<ManualDTO>(this.ls.getUrlAccess('/acc/voucher/manual'), voucher);
    }

    deleteVoucher(key: string): Observable<ManualDTO> {
        return this.http.delete<ManualDTO>(this.ls.getUrlAccess('/acc/voucher/manual/' + key));
    }

    getBalance(catalogId: string): Observable<ResultMapDTO[]> {
        return this.http.get<ResultMapDTO[]>(this.ls.getUrlAccess('/acc/plan/balance/' + catalogId));
    }

    getAccounts(catalogId: string, nameFilter: string = null): Observable<AccountDTO[]> {
        let params = '';
        if (nameFilter) { params = params + 'filter=' + nameFilter; }
        if (params.length !== 0) params = '?' + params;
        return this.http.get<AccountDTO[]>(this.ls.getUrlAccess('/acc/plan/account/' + catalogId + params));
    }

    getAccount(catalog: string, key: string): Observable<AccountDTO> {
      return this.http.get<AccountDTO>(this.ls.getUrlAccess('/acc/plan/account/' + catalog + '/' + key));
    }

    getCatalogs(): Observable<CatalogDTO[]> {
        return this.http.get<CatalogDTO[]>(this.ls.getUrlAccess('/acc/plan/catalog'));
    }

    getCatalog(key: string): Observable<CatalogDTO> {
        return this.http.get<CatalogDTO>(this.ls.getUrlAccess('/acc/plan/catalog/' + key));
    }



}
