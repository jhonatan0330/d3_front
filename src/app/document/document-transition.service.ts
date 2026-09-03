import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DocumentoRelacionGestorDTO, DocumentoRelacionGestorFilterDTO } from './document-transition.types';
import { Observable } from 'rxjs';
import { PedidoVentaCaracteristicaDTO } from 'app/document/model/sw42.domain';
import { LocalStoreService } from 'app/shared/local-store.service';
import { SharedIdResponse } from 'app/shared/api-types';
import { VoucherPrepareRequest } from 'app/accounting/accounting.domain';

@Injectable({
  providedIn: 'root'
})
export class DocumentTransitionService {
  private http = inject(HttpClient);
  private ls = inject(LocalStoreService);


  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------


  getTrace(
    _d: DocumentoRelacionGestorFilterDTO
  ): Observable<DocumentoRelacionGestorDTO[]> {
    return this.http.post<DocumentoRelacionGestorDTO[]>(
      this.ls.getUrlAccess('/template/getTrace'),
      _d
    );
  }
  
  getTraceFields(
    _document: string, _transaction: string
  ): Observable<PedidoVentaCaracteristicaDTO[]> {
    return this.http.get<PedidoVentaCaracteristicaDTO[]>(
      this.ls.getUrlAccess('/template/getTraceFields/' + _document + '/' + _transaction)
    );
  }

  getVoucherOfDocument(pPrepareVoucher: VoucherPrepareRequest): Observable<SharedIdResponse> {
    return this.http.post<SharedIdResponse>(this.ls.getUrlAccess('/acc/voucher/document'),
      pPrepareVoucher
    );
  }

  generateVoucher(pPrepareVoucher: VoucherPrepareRequest): Observable<SharedIdResponse> {
    return this.http.post<SharedIdResponse>(
      this.ls.getUrlAccess('/acc/voucher/generate-voucher'),
      pPrepareVoucher
    );
  }
  
}
