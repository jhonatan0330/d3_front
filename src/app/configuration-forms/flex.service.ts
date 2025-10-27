import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LocalStoreService } from 'app/shared/local-store.service';
import { DocumentoPlantillaCaracteristicaDTO, DocumentoPlantillaDTO, propiedadCampo, RelacionInternaDTO, RelacionInternaFilterDTO } from 'app/modules/full/neuron/model/sw42.domain';

@Injectable({
    providedIn: 'root',
})
export class FlexService {

    constructor(
        private http: HttpClient,
        private ls: LocalStoreService
    ) { }

    getTemplate(pKey: string, _server: string): Observable<DocumentoPlantillaDTO> {
        return this.http.post<DocumentoPlantillaDTO>(
            this.ls.getUrlAccess('/flex/consultaXIdDocumentoPlantilla', _server),
            pKey
        );
    }

    getField(pKey: string, _server: string): Observable<DocumentoPlantillaCaracteristicaDTO> {
        return this.http.post<DocumentoPlantillaCaracteristicaDTO>(
            this.ls.getUrlAccess('/flex/consultaXIdDocumentoPlantillaCaracteristica', _server),
            pKey
        );
    }

    getFields(pTemplateKey: string, _server: string = null): Observable<DocumentoPlantillaCaracteristicaDTO[]> {
        const _payload = {
            estado: 'A',
            plantilla: pTemplateKey
        };
        return this.http.post<DocumentoPlantillaCaracteristicaDTO[]>(
            this.ls.getUrlAccess('/flex/listarConsultaDocumentoPlantillaCaracteristica', _server),
            _payload
        );
    }

    listarConsultaPropiedad(llaveTabla: string, _server: string): Observable<propiedadCampo[]> {
        const payload = {
            estado: 'A',
            campo: llaveTabla
        };
        return this.http.post<propiedadCampo[]>(
            this.ls.getUrlAccess('/flex/listarConsultaPropiedad', _server),
            payload
        );
    }

    // Este lo reportio de api service para mantener los modulos separados
    // despues de crear los enpoitns de configuracion reviso
    relacionesPropiedad(
        filter: RelacionInternaFilterDTO, _server: string
    ): Observable<RelacionInternaDTO[]> {
        return this.http.post<RelacionInternaDTO[]>(
            this.ls.getUrlAccess('/template/getPropertyRelations', _server),
            filter
        );
    }
}
