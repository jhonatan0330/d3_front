import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { RolAccesoFilterDTO, UsuarioAutenticacionDTO, UsuarioDTO } from 'app/authentication/authentication.domain';
import { UsuarioFilterDTO } from './users.domain';
import { LocalStoreService } from 'app/shared/local-store.service';

@Injectable({ providedIn: 'root' })
export class UsersApiService {
    private http = inject(HttpClient);
    private ls = inject(LocalStoreService);

    getRoles(): Observable<RolAccesoFilterDTO[]> {
        return this.http.get<RolAccesoFilterDTO[]>(this.ls.getUrlAccess('/user/getRole'));
    }

    getUsers(filter: UsuarioFilterDTO): Observable<UsuarioDTO[]> {
        return this.http.post<UsuarioDTO[]>(this.ls.getUrlAccess('/user/getUsers'), filter);
    }

    getUserById(userId: string): Observable<UsuarioDTO> {
        return this.http.get<UsuarioDTO>(this.ls.getUrlAccess('/user/' + userId));
    }

    getUserByDocument(documentId: string): Observable<UsuarioDTO> {
        return this.http.get<UsuarioDTO>(this.ls.getUrlAccess('/user/document/' + documentId));
    }

    getRolesByUserId(userId: string): Observable<RolAccesoFilterDTO[]> {
        return this.http.get<RolAccesoFilterDTO[]>(this.ls.getUrlAccess('/user/roles/' + userId));
    }

    validateDFA(auth: UsuarioAutenticacionDTO): Observable<void> {
        return this.http.post<void>(this.ls.getUrlAccess('/user/dfa'), auth);
    }
}
