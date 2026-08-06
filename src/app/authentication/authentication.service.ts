import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LocalStoreService } from 'app/shared/local-store.service';
import { OrganizacionDTO } from './authentication.domain';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {
    private http = inject(HttpClient);
    private ls = inject(LocalStoreService);


    getOrganization(): Observable<OrganizacionDTO> {
        return this.http.get<OrganizacionDTO>(
            this.ls.getUrlAccess('/authentication/obtenerPrincipalOrganizacion')
        );
    }
}