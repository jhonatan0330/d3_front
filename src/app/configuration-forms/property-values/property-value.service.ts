import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { LocalStoreService } from 'app/shared/local-store.service';
import { PropiedadValorDefinidoDTO, PropiedadValorDefinidoFilterDTO } from 'app/modules/full/neuron/model/sw42.domain';

@Injectable({
    providedIn: 'root'
})
export class PropertyValueService {
    private http = inject(HttpClient);
    private ls = inject(LocalStoreService);

    private baseUrl = '/api/config/property-values';

    getPropertyValues(filter?: PropiedadValorDefinidoFilterDTO): Observable<PropiedadValorDefinidoDTO[]> {
        const payload = {
            estado: filter?.estado || 'A',
            origen: filter?.origen || '',
            origenCategoria: filter?.origenCategoria || '',
            codigo: filter?.codigo || '',
            nombre: filter?.nombre || '',
            grupo: filter?.grupo || '',
            paginacionRegistroInicial: filter?.paginacionRegistroInicial || 0,
            paginacionRegistroFinal: filter?.paginacionRegistroFinal || 50
        };
        return this.http.post<PropiedadValorDefinidoDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/list`, undefined),
            payload
        );
    }

    getPropertyValueById(key: string): Observable<PropiedadValorDefinidoDTO> {
        return this.http.post<PropiedadValorDefinidoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${key}`, undefined),
            {}
        );
    }

    getByOrigen(origen: string, origenCategoria?: string): Observable<PropiedadValorDefinidoDTO[]> {
        const payload = { origen, origenCategoria: origenCategoria || '' };
        return this.http.post<PropiedadValorDefinidoDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/by-origen`, undefined),
            payload
        );
    }

    createPropertyValue(value: PropiedadValorDefinidoDTO): Observable<PropiedadValorDefinidoDTO> {
        return this.http.post<PropiedadValorDefinidoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/create`, undefined),
            value
        );
    }

    updatePropertyValue(value: PropiedadValorDefinidoDTO): Observable<PropiedadValorDefinidoDTO> {
        return this.http.post<PropiedadValorDefinidoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/update`, undefined),
            value
        );
    }

    inactivatePropertyValue(value: PropiedadValorDefinidoDTO): Observable<PropiedadValorDefinidoDTO> {
        return this.http.post<PropiedadValorDefinidoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${value.llaveTabla}/inactivate`, undefined),
            value
        );
    }
}