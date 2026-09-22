import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LocalStoreService } from 'app/shared/local-store.service';
import { Observable } from 'rxjs';
import { RolAccesoFilterDTO } from './domain/RolAccesoFilterDTO';
import { UsuarioAutenticacionFilterDTO } from './domain/UsuarioAutenticacionFilterDTO';
import { UsuarioAutenticacionDTO } from './domain/UsuarioAutenticacionDTO';
import { UsuarioAutenticacionAutorizacionDTO } from './domain/UsuarioAutenticacionAutorizacionDTO';
import { OrganizacionDTO } from 'app/document/document.types';
import { UsuarioDTO } from 'app/users/domain/UsuarioDTO';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationApi {
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
        const authentication = new UsuarioDTO();
        authentication.identificacion = identificacion;
        authentication.correo = correo;
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



    getRoles(): Observable<RolAccesoFilterDTO[]> {
        return this.http.get<RolAccesoFilterDTO[]>(this.ls.getUrlAccess('/authentication/getRole'));
    }

    getRolesByUserId(userId: string): Observable<RolAccesoFilterDTO[]> {
        return this.http.get<RolAccesoFilterDTO[]>(this.ls.getUrlAccess('/authentication/roles/' + userId));
    }

    validateDFA(auth: UsuarioAutenticacionDTO): Observable<void> {
        return this.http.post<void>(this.ls.getUrlAccess('/authentication/dfa'), auth);
    }

     verificarToken(usuario: UsuarioAutenticacionDTO): Observable<UsuarioAutenticacionDTO> {
            return this.http.post<UsuarioAutenticacionDTO>(
                this.ls.getUrlAccess('/authentication/dfa'), usuario);
    
        }
}