import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LocalStoreService } from 'app/shared/services/local-store.service';
import { DocumentoRelacionGestorDTO, DocumentoRelacionGestorFilterDTO } from './document-transition.types';
import { Observable } from 'rxjs';
import { PedidoVentaCaracteristicaDTO } from 'app/modules/full/neuron/model/sw42.domain';

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

}
