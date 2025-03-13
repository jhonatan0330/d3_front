import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DocumentoRelacionGestorDTO, DocumentoRelacionGestorFilterDTO } from './document-transition.types';
import { Observable } from 'rxjs';
import { PedidoVentaCaracteristicaDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { LocalStoreService } from 'app/shared/local-store.service';
import { IdResponse } from 'app/modules/full/neuron/model/sw42.utils';
import { VoucherPrepareRequest } from 'app/accounting/accounting.domain';

@Injectable({
  providedIn: 'root'
})
export class DocumentTransitionService {
  
  constructor(
    private http: HttpClient,
    private ls: LocalStoreService
  ) {
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------


  getTrace(
    _d: DocumentoRelacionGestorFilterDTO, _server: string
  ): Observable<DocumentoRelacionGestorDTO[]> {
    return this.http.post<DocumentoRelacionGestorDTO[]>(
      this.ls.getUrlAccess('/template/getTrace', _server),
      _d
    );
  }
  
  getTraceFields(
    _document: string, _transaction: string, _server: string
  ): Observable<PedidoVentaCaracteristicaDTO[]> {
    return this.http.get<PedidoVentaCaracteristicaDTO[]>(
      this.ls.getUrlAccess('/template/getTraceFields/' + _document + '/' + _transaction, _server)
    );
  }

  getVoucherOfDocument(key: string): Observable<IdResponse> {
    return this.http.get<IdResponse>(this.ls.getUrlAccess('/acc/voucher/document/' + key));
  }

  generateVoucher(pPrepareVoucher: VoucherPrepareRequest): Observable<IdResponse> {
    return this.http.post<IdResponse>(
      this.ls.getUrlAccess('/acc/voucher/generate-voucher', null),
      pPrepareVoucher
    );
  }
  
}
