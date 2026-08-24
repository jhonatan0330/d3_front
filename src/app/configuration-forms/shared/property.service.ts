import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { LocalStoreService } from 'app/shared/local-store.service';
import { PropiedadDTO, PropiedadCampoDTO, RelacionInternaDTO, RelacionInternaFilterDTO } from 'app/modules/full/neuron/model/sw42.domain';

@Injectable({
    providedIn: 'root'
})
export class PropertyService {
    private http = inject(HttpClient);
    private ls = inject(LocalStoreService);

    private baseUrl = '/api/config/properties';
    private relationsBaseUrl = '/api/config/properties';

    getProperties(filter?: { campo?: string; estado?: string }): Observable<PropiedadDTO[]> {
        const payload = {
            estado: filter?.estado || 'A',
            campo: filter?.campo || ''
        };
        return this.http.post<PropiedadDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/list`, undefined),
            payload
        );
    }

    getPropertyById(key: string): Observable<PropiedadDTO> {
        return this.http.post<PropiedadDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/by-id`, undefined),
            key
        );
    }

    createProperty(property: PropiedadCampoDTO): Observable<PropiedadDTO> {
        return this.http.post<PropiedadDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/create`, undefined),
            property
        );
    }

    updateProperty(property: PropiedadCampoDTO): Observable<PropiedadDTO> {
        return this.http.post<PropiedadDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/update`, undefined),
            property
        );
    }

    inactivateProperty(property: PropiedadCampoDTO): Observable<PropiedadDTO[]> {
        return this.http.post<PropiedadDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/inactivate`, undefined),
            property
        );
    }

    getRelations(filter: RelacionInternaFilterDTO): Observable<RelacionInternaDTO[]> {
        return this.http.post<RelacionInternaDTO[]>(
            this.ls.getUrlAccess(`${this.relationsBaseUrl}/${filter.propiedad}/relations`, undefined),
            filter
        );
    }

    createRelation(relation: RelacionInternaDTO): Observable<RelacionInternaDTO> {
        return this.http.post<RelacionInternaDTO>(
            this.ls.getUrlAccess(`${this.relationsBaseUrl}/${relation.propiedad}/relations/create`, undefined),
            relation
        );
    }

    updateRelation(relation: RelacionInternaDTO): Observable<RelacionInternaDTO> {
        return this.http.post<RelacionInternaDTO>(
            this.ls.getUrlAccess(`${this.relationsBaseUrl}/${relation.propiedad}/relations/update`, undefined),
            relation
        );
    }

    inactivateRelation(relation: RelacionInternaDTO): Observable<RelacionInternaDTO> {
        return this.http.post<RelacionInternaDTO>(
            this.ls.getUrlAccess(`${this.relationsBaseUrl}/${relation.propiedad}/relations/inactivate`, undefined),
            relation
        );
    }
}