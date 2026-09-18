import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
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
    DocumentoRelacionGestorDTO,
    DocumentoRelacionGestorFilterDTO,
} from './document.types';
import { SharedIdResponse } from 'app/shared/api-types';
import { LocalStoreService } from 'app/shared/local-store.service';
import { UsuarioAutenticacionDTO, UsuarioDTO } from 'app/authentication/authentication.domain';

@Injectable({
    providedIn: 'root',
})
export class ApiService {
    private http = inject(HttpClient);
    private ls = inject(LocalStoreService);


    listarPlantillas(pProfile: string): Observable<DocumentoPlantillaDTO[]> {
        return this.http.get<DocumentoPlantillaDTO[]>(
            this.ls.getUrlAccess('/process/getTemplates/'+ pProfile)
        );
    };

    relacionesPropiedad(
        filter: RelacionInternaFilterDTO
    ): Observable<RelacionInternaDTO[]> {
        return this.http.post<RelacionInternaDTO[]>(
            this.ls.getUrlAccess('/configuration/getPropertyRelations'),
            filter
        );
    }

    validarTipoProcesoCarga(
        filter: DocumentoPlantillaCaracteristicaDTO
    ): Observable<DocumentoPlantillaCaracteristicaDTO> {
        return this.http.post<DocumentoPlantillaCaracteristicaDTO>(
            this.ls.getUrlAccess('/process/validateLoad'),
            filter
        );
    }

    listarDocumentos(filtro: PedidoVentaFilterDTO): Observable<PedidoVentaDTO[]> {
        return this.http.post<PedidoVentaDTO[]>(
            this.ls.getUrlAccess('/document/get'),
            filtro
        );
    }

    obtenerCampos(plantillaId: string): Observable<DocumentoPlantillaDTO> {
        const dpFilter: DocumentoPlantillaDTO = new DocumentoPlantillaDTO();
        dpFilter.llaveTabla = plantillaId;
        return this.http.post<DocumentoPlantillaDTO>(
            this.ls.getUrlAccess('/process/obtenerCampos'),
            dpFilter
        );
    }

    consultarDocumento(
        documentoFiltro: PedidoVentaFilterDTO
    ): Observable<PedidoVentaDTO> {
        return this.http.post<PedidoVentaDTO>(
            this.ls.getUrlAccess('/document/api/consultarDocumento'),
            documentoFiltro
        );
    }

    validateBeforeNew(
        documentoFiltro: PedidoVentaFilterDTO
    ): Observable<PedidoVentaDTO> {
        return this.http.post<PedidoVentaDTO>(
            this.ls.getUrlAccess('/document/api/validateBeforeNew'),
            documentoFiltro
        );
    }

    guardarDocumento(documento: PedidoVentaDTO, session: string): Observable<PedidoVentaDTO> {
        return this.postDocumento('/document/save', documento, session);
    }

    saveByMassive(documento: PedidoVentaDTO, session: string): Observable<PedidoVentaDTO> {
        return this.postDocumento('/document/saveByMassive', documento, session);
    }

    private postDocumento(endpoint: string, documento: PedidoVentaDTO, session: string): Observable<PedidoVentaDTO> {
        const headers = { 'non-duplicate': session };
        return this.http.post<PedidoVentaDTO>(
            this.ls.getUrlAccess(endpoint),
            documento, { headers }
        );
    }

    verificarToken(usuario: UsuarioAutenticacionDTO): Observable<UsuarioAutenticacionDTO> {
        return this.http.post<UsuarioAutenticacionDTO>(
            this.ls.getUrlAccess('/authentication/dfa'), usuario);

    }

    consultarDatosBase(
        campo: PedidoVentaCaracteristicaFilterDTO
    ): Observable<PedidoVentaCaracteristicaFilterDTO> {
        const filter: PedidoVentaCaracteristicaFilterDTO = new PedidoVentaCaracteristicaFilterDTO();
        // Fijo se necesitan
        filter.campo = campo.campo;
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

        if (campo.dependientes) {
            filter.dependientes = [];
            for (let i = 0; i < campo.dependientes.length; i++) {
                const element = campo.dependientes[i];
                const newElement = new PedidoVentaCaracteristicaDTO();

                newElement.valorOpcion = element.valorOpcion;
                newElement.valorNumero = element.valorNumero;
                newElement.valorFecha = element.valorFecha;
                newElement.valorText = element.valorText;
                newElement.campo = element.campo;
                //Es encesario para que se calculen algunas formulas, trustmetrans recibo de factura
                newElement.expedientes = element.expedientes;

                filter.dependientes.push(newElement)
            }

        }


        return this.http.post<PedidoVentaCaracteristicaFilterDTO>(
            this.ls.getUrlAccess('/document/getFieldData'),
            filter
        );
    }

    ajustarEstado(
        ajuste: PedidoVentaAjusteDTO
    ): Observable<PedidoVentaAjusteDTO> {
        return this.http.post<PedidoVentaAjusteDTO>(
            this.ls.getUrlAccess('/document/api/changeState'),
            ajuste
        );
    }

    getImage(imageUrl: string): Observable<Blob> {
        return this.http.get(imageUrl, { responseType: 'blob' });
    }

    /*uploadFile(fileToUpload: File): Observable<string> {
        const endpoint = this.ls.getUrlAccess('/upload/upload');
        const formData: FormData = new FormData();
        formData.append('file', fileToUpload, fileToUpload.name);
        return this.http.post<string>(endpoint, formData);
    }*/


    consultarInventario(productoId: string): Observable<ProductoInventarioDTO[]> {
        return this.http.get<ProductoInventarioDTO[]>(
            this.ls.getUrlAccess('/inventory/getInventory/' + productoId)
        );
    }

    getMessageInFiledProccess(property: string, value: string): Observable<SharedIdResponse> {
        const endpoint = this.ls.getUrlAccess('/document/api/getMessageToProcessField/' + property + '/' + value);
        return this.http.get<SharedIdResponse>(endpoint);
    }


    searchUserByRol(query: string): Observable<UsuarioDTO> {
        return this.http
            .get<UsuarioDTO>(this.ls.getUrlAccess('/users/document/' + query));
    }

    getTrace(
    _d: DocumentoRelacionGestorFilterDTO
  ): Observable<DocumentoRelacionGestorDTO[]> {
    return this.http.post<DocumentoRelacionGestorDTO[]>(
      this.ls.getUrlAccess('/document/getTrace'),
      _d
    );
  }

  getTraceFields(
    _document: string, _transaction: string
  ): Observable<PedidoVentaCaracteristicaDTO[]> {
    return this.http.get<PedidoVentaCaracteristicaDTO[]>(
      this.ls.getUrlAccess('/document/getTraceFields/' + _document + '/' + _transaction)
    );
  }

}
