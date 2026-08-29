import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { catchError, map, Observable, of, switchMap, tap, } from 'rxjs';
import { LocalStoreService } from 'app/shared/local-store.service';
import { PermisosDTO, RolAccesoFilterDTO, UsuarioDTO } from 'app/authentication/authentication.domain';

@Injectable({ providedIn: 'root' })
export class ContactsService {
    private _httpClient = inject(HttpClient);
    private ls = inject(LocalStoreService);

    // Private
    private readonly _contact = signal<UsuarioDTO | null>(null);
    private readonly _contacts = signal<UsuarioDTO[] | null>(null);


    get contact() {
        return this._contact.asReadonly();
    }

    get contacts() {
        return this._contacts.asReadonly();
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
                this._contacts.set(contacts);
            })
        );
    }

    clearContacts(): void {
        this._contacts.set([]);
    }

    searchContacts(query: string): Observable<UsuarioDTO[]> {
        return this._httpClient.post<UsuarioDTO[]>(
            this.ls.getUrlAccess('/user/getUsers'),
            { estado: 'A', identificacion: query } // Búsqueda directa por identificación
        ).pipe(
            switchMap((contacts) => {
                // Si se encontraron contactos con la identificación, los retorna
                if (contacts.length > 0) {
                    this._contacts.set(contacts); // Actualiza el signal
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
                        tap((filtered) => this._contacts.set(filtered)) // Actualiza el signal con los filtrados
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
            tap((contacts) => this._contacts.set(contacts))
        );
    }

    getContactById(query: string): Observable<UsuarioDTO> {
        return this._httpClient.get<UsuarioDTO>(
            this.ls.getUrlAccess('/user/' + query)
        ).pipe(
            tap((contacts) => this._contact.set(contacts))
        );
    }

}
