import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
    BehaviorSubject,
    catchError,
    debounceTime,
    map,
    Observable,
    of,
    switchMap,
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
            ;
    }

    searchTagsById(query: string): Observable<RolAccesoFilterDTO[]> {
        return this._httpClient
            .get<RolAccesoFilterDTO[]>(this.ls.getUrlAccess('/user/roles/' + query))
            ;
    }

    getContacts(): Observable<UsuarioDTO[]> {
        return this._httpClient.post<UsuarioDTO[]>(
            this.ls.getUrlAccess('/user/getUsers'),
            { estado: 'A' }
        ).pipe(
            tap((contacts) => {
                this._contacts.next(contacts);
            })
        );
    }


    searchContacts(query: string): Observable<UsuarioDTO[]> {
        // Primero, intenta buscar por identificación en el servidor
        return this._httpClient.post<UsuarioDTO[]>(
            this.ls.getUrlAccess('/user/getUsers'),
            { estado: 'A', identificacion: query } // Búsqueda directa por identificación
        ).pipe(
            switchMap((contacts) => {
                // Si se encontraron contactos con la identificación, los retorna
                if (contacts.length > 0) {
                    this._contacts.next(contacts); // Actualiza el Subject
                    return of(contacts); // Devuelve los contactos encontrados
                } else {
                    // Si no hay resultados, se realiza la búsqueda general
                    return this._httpClient.post<UsuarioDTO[]>(
                        this.ls.getUrlAccess('/user/getUsers'),
                        { estado: 'A' } // Filtrado por estado solo
                    ).pipe(
                        map((allContacts) =>
                            allContacts.filter(c =>
                                c.identificacion?.includes(query) ||
                                c.nombre?.toLowerCase().includes(query.toLowerCase())
                            )
                        ),
                        tap((filtered) => this._contacts.next(filtered)) // Actualiza el Subject con los filtrados
                    );
                }
            }),
            catchError(error => {
                console.error('Error en la búsqueda de contactos:', error);
                return of([]); // Devuelve un array vacío en caso de error
            })
        );
    }


    getContactByTag(query: string): Observable<UsuarioDTO[]> {
        return this._httpClient.post<UsuarioDTO[]>(
            this.ls.getUrlAccess('/user/getUsers'),
            {
                estado: 'A',
                rol: query,
                filtroParametro: 'A'
            }
        ).pipe(
            tap((contacts) => this._contacts.next(contacts))
        );
    }

    getContactById(query: string): Observable<UsuarioDTO> {
        return this._httpClient.get<UsuarioDTO>(
            this.ls.getUrlAccess('/user/' + query)
        ).pipe(
            tap((contacts) => this._contact.next(contacts))
        );
    }

}
