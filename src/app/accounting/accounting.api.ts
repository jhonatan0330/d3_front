import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AccountDTO, CatalogDTO, ManualDTO, ResultMapDTO, Voucher, VoucherPrepareRequest } from './domain/accounting.domain';
import { LocalStoreService } from 'app/shared/local-store.service';
import { SharedIdResponse } from 'app/shared/api-types';

@Injectable({ providedIn: 'root' })
export class AccountingService {
  private http = inject(HttpClient);
  private ls = inject(LocalStoreService);


  public currentCatalog: CatalogDTO;

  getVouchers(catalogId: string): Observable<ManualDTO[]> {
    return this.http.get<ManualDTO[]>(this.ls.getUrlAccess('/accounting/voucher/' + catalogId));
  }

  getVoucher(key: string): Observable<Voucher> {
    return this.http.get<Voucher>(this.ls.getUrlAccess('/accounting/voucher/one/' + key));
  }

  createManual(voucher: Voucher): Observable<ManualDTO> {
    return this.http.post<ManualDTO>(this.ls.getUrlAccess('/accounting/voucher/manual'), voucher);
  }

  updateManual(voucher: Voucher): Observable<ManualDTO> {
    return this.http.post<ManualDTO>(this.ls.getUrlAccess('/accounting/voucher/manual'), voucher);
  }

  updateVoucher(voucher: ManualDTO): Observable<ManualDTO> {
    return this.http.post<ManualDTO>(this.ls.getUrlAccess('/accounting/voucher/manual'), voucher);
  }

  deleteVoucher(key: string): Observable<ManualDTO> {
    return this.http.delete<ManualDTO>(this.ls.getUrlAccess('/accounting/voucher/manual/' + key));
  }

  getBalance(catalogId: string): Observable<ResultMapDTO[]> {
    return this.http.get<ResultMapDTO[]>(this.ls.getUrlAccess('/accounting/plan/balance/' + catalogId));
  }

  getAccounts(catalogId: string, nameFilter: string | null = null): Observable<AccountDTO[]> {
    let params = '';
    if (nameFilter) { params = params + 'filter=' + nameFilter; }
    if (params.length !== 0) params = '?' + params;
    return this.http.get<AccountDTO[]>(this.ls.getUrlAccess('/accounting/plan/account/' + catalogId + params));
  }

  getAccount(catalog: string, key: string): Observable<AccountDTO> {
    return this.http.get<AccountDTO>(this.ls.getUrlAccess('/accounting/plan/account/' + catalog + '/' + key));
  }

  getCatalogs(): Observable<CatalogDTO[]> {
    return this.http.get<CatalogDTO[]>(this.ls.getUrlAccess('/accounting/plan/catalog'));
  }

  getCatalog(key: string): Observable<CatalogDTO> {
    return this.http.get<CatalogDTO>(this.ls.getUrlAccess('/accounting/plan/catalog/' + key));
  }


  getVoucherOfDocument(pPrepareVoucher: VoucherPrepareRequest): Observable<SharedIdResponse> {
    return this.http.post<SharedIdResponse>(this.ls.getUrlAccess('/accounting/voucher/document'),
      pPrepareVoucher
    );
  }

  generateVoucher(pPrepareVoucher: VoucherPrepareRequest): Observable<SharedIdResponse> {
    return this.http.post<SharedIdResponse>(
      this.ls.getUrlAccess('/accounting/voucher/generate-voucher'),
      pPrepareVoucher
    );
  }

}


