import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  LocalConstants,
  LocalStoreService,
} from '../../../../shared/services/local-store.service';

import {
  ActividadDTO,
  DocumentoPlantillaDTO,
  OrganizacionDTO,
  UsuarioAutenticacionDTO,
  UsuarioDTO,
  PedidoVentaDTO,
  DocumentoRelacionGestorDTO,
  RelacionInternaDTO,
  DocumentoPlantillaCaracteristicaDTO,
  PedidoVentaAjusteDTO,
  ProductoInventarioDTO,
  ProductoDTO,
  TarifaDTO,
  PedidoVentaCaracteristicaDTO,
} from '../../../../model/sw42.domain';
import { ApiErrorResponse } from '../../../../model/sw42.utils';
import {
  UsuarioAutenticacionFilterDTO,
  PedidoVentaFilterDTO,
  PedidoVentaCaracteristicaFilterDTO,
  DocumentoRelacionGestorFilterDTO,
  RelacionInternaFilterDTO,
} from '../../../../model/sw42.filter';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private _jsonURL = '/assets/conf.xml';

  constructor(
    private http: HttpClient,
    private ls: LocalStoreService
  ) {}

  // CU01
  obtenerPrincipalOrganizacion(): Observable<OrganizacionDTO> {
    return this.http.get<OrganizacionDTO>(
      this.ls.getUrlAccess('/main/obtenerPrincipalOrganizacion')
    );
  }

  autenticar(
    username: string,
    password: string,
    _server: string
  ): Observable<UsuarioAutenticacionDTO> {
    const autenticacion: UsuarioAutenticacionFilterDTO =
      new UsuarioAutenticacionFilterDTO();
    autenticacion.sesion = username;
    autenticacion.clave = password;
    autenticacion.claveAnterior = `${environment.dateCompile}`;
    return this.http.post<UsuarioAutenticacionDTO>(
      this.ls.getUrlAccess('/main/autenticarUsuarioAutenticacion', _server),
      autenticacion
    );
  }

  listarPlantillas(_server: string=null): Observable<DocumentoPlantillaDTO[]> {
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

  consultarProducto(productoId: String, _server: string): Observable<ProductoDTO> {
    return this.http.get<ProductoDTO>(
      this.ls.getUrlAccess('/document/getProduct/' + productoId, _server)
    );
  }

  actualizarProducto(producto: ProductoDTO, _server: string): Observable<ProductoDTO> {
    return this.http.post<ProductoDTO>(
      this.ls.getUrlAccess('/document/updateProduct', _server),
      producto
    );
  }

  consultarProductos2Filter(filter: String, _server: string): Observable<ProductoDTO[]> {
    return this.http.get<ProductoDTO[]>(
      this.ls.getUrlAccess('/document/getProducts/' + filter, _server)
    );
  }

  consultarTarifasProducto(productId: String, _server: string): Observable<TarifaDTO[]> {
    return this.http.get<TarifaDTO[]>(
      this.ls.getUrlAccess('/document/getTarifas/' + productId, _server)
    );
  }

  consultarInventario(productoId: String, _server: string): Observable<ProductoInventarioDTO[]> {
    return this.http.get<ProductoInventarioDTO[]>(
      this.ls.getUrlAccess('/document/getInventory/' + productoId, _server)
    );
  }

  listarDocumentos(filtro: PedidoVentaFilterDTO, _server: string): Observable<PedidoVentaDTO[]> {
    return this.http.post<PedidoVentaDTO[]>(
      this.ls.getUrlAccess('/document/getDocuments', _server),
      filtro
    );
  }

  listUserActivities(_server: string): Observable<ActividadDTO[]> {
    return this.http.get<ActividadDTO[]>(
      this.ls.getUrlAccess('/document/getUserActivities', _server)
    );
  }

  readActivity(actividad: ActividadDTO, _server: string): Observable<ActividadDTO> {
    return this.http.post<ActividadDTO>(
      this.ls.getUrlAccess('/document/readActivity', _server),
      actividad
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

  guardarDocumento(documento: PedidoVentaDTO, _server: string): Observable<PedidoVentaDTO> {
    return this.http.post<PedidoVentaDTO>(
      this.ls.getUrlAccess('/rest/guardarDocumento', _server),
      documento
    );
  }

  /*eliminarDocumento(documento: PedidoVentaDTO): Observable<PedidoVentaDTO> {
    return this.http.post<PedidoVentaDTO>(
      this.ls.getUrlAccess('/rest/eliminarDocumento'),
      documento
    );
  }*/

  consultarUsuario(usuario: UsuarioDTO): Observable<UsuarioDTO> {
    return this.http.post<UsuarioDTO>(
      this.ls.getUrlAccess('/rest/consultarUsuario'),
      usuario
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

  reasignar(plantilla: ActividadDTO, _server: string): Observable<ActividadDTO> {
    return this.http.post<ActividadDTO>(
      this.ls.getUrlAccess('/rest/reasignar', _server),
      plantilla
    );
  }

  usuariosXRol(plantilla: PedidoVentaFilterDTO, _server: string): Observable<UsuarioDTO[]> {
    return this.http.post<UsuarioDTO[]>(
      this.ls.getUrlAccess('/rest/usuariosXRol', _server),
      plantilla
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

  getURL(): Observable<String> {
    return this.http.get(this._jsonURL, { responseType: 'text' });
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

  changePictureUser(fileToUpload: File, _server: string): Observable<UsuarioDTO> {
    const endpoint = this.ls.getUrlAccess('/rest/changePicture', _server);
    const formData: FormData = new FormData();
    formData.append('file', fileToUpload, fileToUpload.name);
    return this.http.post<UsuarioDTO>(endpoint, formData);
  }
}
