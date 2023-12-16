import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LocalStoreService } from 'app/shared/local-store.service';
import { OrganizacionDTO } from './authentication.domain';
import { Observable } from 'rxjs';
import { PropiedadDTO, PropiedadValorDefinidoDTO } from 'app/shared/shared.domain';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {

    constructor(
        private http: HttpClient,
        private ls: LocalStoreService) {
    }

    getOrganization(): Observable<OrganizacionDTO> {
        return this.http.get<OrganizacionDTO>(
            this.ls.getUrlAccess('/authentication/obtenerPrincipalOrganizacion')
        );
    }
}