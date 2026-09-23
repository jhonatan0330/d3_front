import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { LocalStoreService } from 'app/shared/local-store.service';
import { UsuarioFilterDTO } from './domain/UsuarioFilterDTO';
import { UsuarioDTO } from './domain/UsuarioDTO';

@Injectable({ providedIn: 'root' })
export class UsersApi {
    private http = inject(HttpClient);
    private ls = inject(LocalStoreService);

    getUsers(filter: UsuarioFilterDTO): Observable<UsuarioDTO[]> {
        return this.http.post<UsuarioDTO[]>(this.ls.getUrlAccess('/users/getUsers'), filter);
    }

    getUserById(userId: string): Observable<UsuarioDTO> {
        return this.http.get<UsuarioDTO>(this.ls.getUrlAccess('/users/' + userId));
    }

    getUserByDocument(documentId: string): Observable<UsuarioDTO> {
        return this.http.get<UsuarioDTO>(this.ls.getUrlAccess('/users/document/' + documentId));
    }

        searchUserByRol(query: string): Observable<UsuarioDTO> {
        return this.http
            .get<UsuarioDTO>(this.ls.getUrlAccess('/users/document/' + query));
    }

    changePicture(url: string): Observable<UsuarioDTO> {
        return this.http.post<UsuarioDTO>(
            this.ls.getUrlAccess('/users/changePicture'),
            { url }
        );
    }

    usersToTransfer(documentId: string): Observable<UsuarioDTO[]> {
        return this.http.post<UsuarioDTO[]>(
            this.ls.getUrlAccess('/users/userToTransfer/' + documentId),
            null
        );
    }

}
