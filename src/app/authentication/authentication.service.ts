import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LocalStoreService } from 'app/shared/local-store.service';
import {
    OrganizacionDTO,
    UsuarioAutenticacionAutorizacionDTO,
    UsuarioAutenticacionDTO,
    UsuarioAutenticacionFilterDTO,
    UsuarioDTO
} from './authentication.domain';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {
    private http = inject(HttpClient);
    private ls = inject(LocalStoreService);


    authenticate(authentication: UsuarioAutenticacionFilterDTO): Observable<UsuarioAutenticacionDTO> {
        return this.http.post<UsuarioAutenticacionDTO>(
            this.ls.getUrlAccess('/authentication/autenticarUsuarioAutenticacion'),
            authentication
        );
    }

    checkToken(authentication: UsuarioAutenticacionFilterDTO): Observable<UsuarioAutenticacionDTO> {
        return this.http.post<UsuarioAutenticacionDTO>(
            this.ls.getUrlAccess('/authentication/checkToken'),
            authentication
        );
    }

    changePassword(authentication: UsuarioAutenticacionDTO): Observable<UsuarioAutenticacionDTO> {
        return this.http.post<UsuarioAutenticacionDTO>(
            this.ls.getUrlAccess('/authentication/cambiarClave'),
            authentication
        );
    }

    recoverPassword(identificacion: string, correo: string): Observable<UsuarioAutenticacionAutorizacionDTO> {
        const authentication = new UsuarioAutenticacionDTO();
        authentication.usuarioDTO = new UsuarioDTO();
        authentication.usuarioDTO.identificacion = identificacion;
        authentication.usuarioDTO.correo = correo;
        return this.http.post<UsuarioAutenticacionAutorizacionDTO>(
            this.ls.getUrlAccess('/authentication/solicitarNuevaClave'),
            authentication
        );
    }

    getOrganization(): Observable<OrganizacionDTO> {
        return this.http.get<OrganizacionDTO>(
            this.ls.getUrlAccess('/authentication/obtenerPrincipalOrganizacion')
        );
    }

    getConfigUrl(): Observable<string> {
        return this.http.get('/assets/conf.xml', { responseType: 'text' });
    }

    changePicture(url: string): Observable<UsuarioDTO> {
        return this.http.post<UsuarioDTO>(
            this.ls.getUrlAccess('/users/changePicture'),
            { url }
        );
    }
}