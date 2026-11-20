import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DocumentApi } from 'app/document/document.api';
import { PedidoVentaDTO, PedidoVentaFilterDTO } from 'app/document/document.types';

@Injectable({ providedIn: 'root' })
export class DocumentListService {
  private readonly api = inject(DocumentApi);

  loadPage(
    filter: PedidoVentaFilterDTO,
    templateId: string,
    page: number,
    pageSize: number,
  ): Observable<PedidoVentaDTO[]> {
    const request = Object.assign(new PedidoVentaFilterDTO(), filter);
    request.plantilla = request.plantilla || templateId;
    request.paginacionRegistroInicial = pageSize * (page - 1);
    request.paginacionRegistroFinal = pageSize;
    return this.api.listarDocumentos(request);
  }
}
