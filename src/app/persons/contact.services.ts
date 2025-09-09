import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
    BehaviorSubject,
    debounceTime,
    map,
    Observable,
    tap,
} from 'rxjs';
import { LocalStoreService } from 'app/shared/local-store.service';
import { RolAccesoFilterDTO, UsuarioDTO } from 'app/authentication/authentication.domain';

@Injectable({ providedIn: 'root' })
export class ContactsService {
    // Private
    private _contact: BehaviorSubject<UsuarioDTO | null> = new BehaviorSubject(
        null
    );
    private _contacts: BehaviorSubject<UsuarioDTO[] | null> = new BehaviorSubject(
        null
    );

    constructor(private _httpClient: HttpClient, private ls: LocalStoreService) { }


    get contact$(): Observable<UsuarioDTO> {
        return this._contact.asObservable();
    }

    get contacts$(): Observable<UsuarioDTO[]> {
        return this._contacts.asObservable();
    }



    searchTags(): Observable<RolAccesoFilterDTO[]> {
        return this._httpClient
            .get<RolAccesoFilterDTO[]>(this.ls.getUrlAccess('/user/getRole'))
            .pipe(
                debounceTime(100)
            );
    }

    searchTagsById(query: string): Observable<RolAccesoFilterDTO[]> {
        return this._httpClient
            .get<RolAccesoFilterDTO[]>(this.ls.getUrlAccess('/user/roles/'+query))
            ;
    }

    getContacts(): Observable<UsuarioDTO[]> {
        return this._httpClient.post<UsuarioDTO[]>(
            this.ls.getUrlAccess('/user/getUsers'),
            { estado: 'A' }
        ).pipe(
            debounceTime(100),
            tap((contacts) => {
                this._contacts.next(contacts);
            })
        );
    }


    searchContacts(query: string): Observable<UsuarioDTO[]> {
        return this._httpClient.post<UsuarioDTO[]>(
            this.ls.getUrlAccess('/user/getUsers'),
            { estado: 'A' }
        ).pipe(
            debounceTime(100),
            map((contacts) =>
                contacts.filter(c =>
                    c.identificacion?.includes(query) ||
                    c.nombre?.toLowerCase().includes(query.toLowerCase())
                )
            ),
            tap((filtered) => this._contacts.next(filtered))
        );
    }

    getContactByTag(query: string): Observable<UsuarioDTO[]> {
        return this._httpClient.post<UsuarioDTO[]>(
            this.ls.getUrlAccess('/user/getUsers'),
            {
                estado: 'A',
                rol: query,
                filtroParametro : 'A'
            }
            ).pipe(
                debounceTime(100),
                tap((contacts) => this._contacts.next(contacts))
            );
    }

    getContactById(query: string): Observable<UsuarioDTO> {
        return this._httpClient.get<UsuarioDTO>(
            this.ls.getUrlAccess('/user/'+query)
            ).pipe(
                tap((contacts) => this._contact.next(contacts))
            );
    }

}
