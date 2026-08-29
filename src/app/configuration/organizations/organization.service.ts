import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { LocalStoreService } from 'app/shared/local-store.service';
import { OrganizacionDTO, OrganizacionFilterDTO } from 'app/document/model/sw42.domain';

@Injectable({
    providedIn: 'root'
})
export class OrganizationService {
    private http = inject(HttpClient);
    private ls = inject(LocalStoreService);

    private baseUrl = '/api/config/organizations';

    getOrganizaciones(filter?: OrganizacionFilterDTO): Observable<OrganizacionDTO[]> {
        const payload = {
            estado: filter?.estado || 'A',
            nombre: filter?.nombre || '',
            codigo: filter?.codigo || '',
            nit: filter?.nit || '',
            principal: filter?.principal,
            paginacionRegistroInicial: filter?.paginacionRegistroInicial || 0,
            paginacionRegistroFinal: filter?.paginacionRegistroFinal || 50
        };
        return this.http.post<OrganizacionDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/list`, undefined),
            payload
        );
    }

    getOrganizacionById(key: string): Observable<OrganizacionDTO> {
        return this.http.post<OrganizacionDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${key}`, undefined),
            {}
        );
    }

    getPrincipal(): Observable<OrganizacionDTO> {
        return this.http.post<OrganizacionDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/principal`, undefined),
            {}
        );
    }

    createOrganizacion(org: OrganizacionDTO): Observable<OrganizacionDTO> {
        return this.http.post<OrganizacionDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/create`, undefined),
            org
        );
    }

    updateOrganizacion(org: OrganizacionDTO): Observable<OrganizacionDTO> {
        return this.http.post<OrganizacionDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/update`, undefined),
            org
        );
    }

    inactivateOrganizacion(org: OrganizacionDTO): Observable<OrganizacionDTO> {
        return this.http.post<OrganizacionDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${org.llaveTabla}/inactivate`, undefined),
            org
        );
    }
}