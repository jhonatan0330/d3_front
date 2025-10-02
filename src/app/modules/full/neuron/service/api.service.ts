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
  PedidoVentaCaracteristicaDTO,
} from '../model/sw42.domain';
import { ApiErrorResponse, IdResponse } from '../model/sw42.utils';
import { LocalConstants, LocalStoreService } from 'app/shared/local-store.service';
import { UsuarioDTO } from 'app/authentication/authentication.domain';

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

  validateBeforeNew(
    documentoFiltro: PedidoVentaFilterDTO, _server: string
  ): Observable<PedidoVentaDTO> {
    return this.http.post<PedidoVentaDTO>(
      this.ls.getUrlAccess('/rest/validateBeforeNew', _server),
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
    const filter: PedidoVentaCaracteristicaFilterDTO = new PedidoVentaCaracteristicaFilterDTO();
    // Fijo se necesitan
    filter.campo = campo.campo;
    filter.securityToken = campo.securityToken;
    filter.llaveTabla = campo.llaveTabla;
    filter.filtroParametro = campo.filtroParametro;
    filter.documento = campo.documento;
    filter.valorOpcion = campo.valorOpcion;
    filter.valorText = campo.valorText;
    // Creo que no lo necesito
    filter.paginacionRegistroFinal = campo.paginacionRegistroFinal;
    filter.paginacionRegistroInicial = campo.paginacionRegistroInicial;
    filter.valorAuxiliar = campo.valorAuxiliar;
    filter.valorFechaMax = campo.valorFechaMax;
    filter.valorFechaMin = campo.valorFechaMin;
    filter.valorNumeroMax = campo.valorNumeroMax;
    filter.valorNumeroMin = campo.valorNumeroMin;
    
    if(campo.dependientes){
      filter.dependientes = [];
      for (let i = 0; i < campo.dependientes.length; i++) {
        const element = campo.dependientes[i];
        const newElement = new PedidoVentaCaracteristicaDTO();

        newElement.valorOpcion = element.valorOpcion;
        newElement.valorNumero = element.valorNumero;
        newElement.valorFecha = element.valorFecha;
        newElement.valorText = element.valorText;
        newElement.campo = element.campo;
        
        filter.dependientes.push(newElement)
      }
    }

    
    return this.http.post<PedidoVentaCaracteristicaFilterDTO>(
      this.ls.getUrlAccess('/rest/consultarDatosBase', _server),
      filter
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

  getMessageInFiledProccess(property: String, value: String, _server: string=null): Observable<IdResponse> {
    const endpoint = this.ls.getUrlAccess('/rest/getMessageToProcessField/' + property + '/'+value, _server);
    return this.http.get<IdResponse>( endpoint);
  }

  
  searchUserByRol(query: string): Observable<UsuarioDTO> {
    return this.http
              .get<UsuarioDTO>(this.ls.getUrlAccess('/user/document/' + query));
  }
}
