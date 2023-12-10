import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  DocumentoPlantillaDTO,
  PedidoVentaDTO,
  RelacionInternaDTO,
  DocumentoPlantillaCaracteristicaDTO,
  PedidoVentaAjusteDTO,
  ProductoInventarioDTO,
  PedidoVentaFilterDTO,
  RelacionInternaFilterDTO,
  PedidoVentaCaracteristicaFilterDTO,
} from '../model/sw42.domain';
import { ApiErrorResponse } from '../model/sw42.utils';
import { LocalConstants, LocalStoreService } from 'app/shared/local-store.service';

@Injectable({
  providedIn: 'root',
})
export class ApiService {

  constructor(
    private http: HttpClient,
    private ls: LocalStoreService
  ) {}

  listarPlantillas(_server: string): Observable<DocumentoPlantillaDTO[]> {
    return this.http.get<DocumentoPlantillaDTO[]>(
      this.ls.getUrlAccess('/template/getTemplates', _server)
    );
  }

  relacionesPropiedad(
    filter: RelacionInternaFilterDTO, _server: string
  ): Observable<RelacionInternaDTO[]> {
    return this.http.post<RelacionInternaDTO[]>(
      this.ls.getUrlAccess('/template/getPropertyRelations', _server),
      filter
    );
  }

  validarTipoProcesoCarga(
    filter: DocumentoPlantillaCaracteristicaDTO, _server: string
  ): Observable<DocumentoPlantillaCaracteristicaDTO> {
    return this.http.post<DocumentoPlantillaCaracteristicaDTO>(
      this.ls.getUrlAccess('/template/validateLoad', _server),
      filter
    );
  }

  listarDocumentos(filtro: PedidoVentaFilterDTO, _server: string): Observable<PedidoVentaDTO[]> {
    return this.http.post<PedidoVentaDTO[]>(
      this.ls.getUrlAccess('/document/getDocuments', _server),
      filtro
    );
  }

  listarDocumentosFull(): Observable<DocumentoPlantillaDTO[]> {
    return this.http.get<DocumentoPlantillaDTO[]>(
      this.ls.getUrlAccess('/main/getAdministratorTemplates')
    );
  }

  obtenerCampos(plantillaId: string, _server: string): Observable<DocumentoPlantillaDTO> {
    const dpFilter: DocumentoPlantillaDTO = new DocumentoPlantillaDTO();
    dpFilter.llaveTabla = plantillaId;
    return this.http.post<DocumentoPlantillaDTO>(
      this.ls.getUrlAccess('/rest/obtenerCampos', _server),
      dpFilter
    );
  }

  consultarDocumento(
    documentoFiltro: PedidoVentaFilterDTO, _server: string
  ): Observable<PedidoVentaDTO> {
    return this.http.post<PedidoVentaDTO>(
      this.ls.getUrlAccess('/rest/consultarDocumento', _server),
      documentoFiltro
    );
  }

  guardarDocumento(documento: PedidoVentaDTO, _server: string, session: string): Observable<PedidoVentaDTO> {
    const headers = { 'non-duplicate': session };
    return this.http.post<PedidoVentaDTO>(
      this.ls.getUrlAccess('/rest/guardarDocumento', _server),
      documento, {headers}
    );
  }

  consultarDatosBase(
    campo: PedidoVentaCaracteristicaFilterDTO, _server: string
  ): Observable<PedidoVentaCaracteristicaFilterDTO> {
    return this.http.post<PedidoVentaCaracteristicaFilterDTO>(
      this.ls.getUrlAccess('/rest/consultarDatosBase', _server),
      campo
    );
  }

  ajustarEstado(
    ajuste: PedidoVentaAjusteDTO, _server: string
  ): Observable<PedidoVentaAjusteDTO> {
    return this.http.post<PedidoVentaAjusteDTO>(
      this.ls.getUrlAccess('/rest/changeState', _server),
      ajuste
    );
  }

  getTemplates(): DocumentoPlantillaDTO[] {
    return this.ls.getItem(LocalConstants.TEMPLATES);
  }

  getImage(imageUrl: string): Observable<Blob> {
    return this.http.get(imageUrl, { responseType: 'blob' });
  }

  uploadFile(fileToUpload: File, _server: string): Observable<ApiErrorResponse> {
    const endpoint = this.ls.getUrlAccess('/rest/upload', _server);
    const formData: FormData = new FormData();
    formData.append('file', fileToUpload, fileToUpload.name);
    return this.http.post<ApiErrorResponse>(endpoint, formData);
  }


  consultarInventario(productoId: String, _server: string): Observable<ProductoInventarioDTO[]> {
    return this.http.get<ProductoInventarioDTO[]>(
      this.ls.getUrlAccess('/document/getInventory/' + productoId, _server)
    );
  }
}
