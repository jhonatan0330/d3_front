import { inject, Injectable,  signal } from '@angular/core';
import { catchError, map, Observable, of, switchMap, tap, } from 'rxjs';
import { UsersApi } from '../users.api';
import { RolAccesoFilterDTO } from 'app/authentication/domain/RolAccesoFilterDTO';
import { UsuarioDTO } from '../domain/UsuarioDTO';
import { AuthenticationApi } from 'app/authentication/authentication.api';

@Injectable({ providedIn: 'root' })
export class UsersService {
    
    private readonly _contact = signal<UsuarioDTO | null>(null);
    private readonly _contacts = signal<UsuarioDTO[] | null>(null);
    private userApiService = inject(UsersApi);
    private readonly authenticationApi = inject(AuthenticationApi);

    get contact() {
        return this._contact.asReadonly();
    }

    get contacts() {
        return this._contacts.asReadonly();
    }

    searchTags(): Observable<RolAccesoFilterDTO[]> {
        return this.authenticationApi.getRoles();
    }

    searchTagsById(query: string): Observable<RolAccesoFilterDTO[]> {
        return this.authenticationApi.getRolesByUserId(query);         ;
    }

    getContacts() {
        this.userApiService.getUsers({ estado: 'A' }).pipe(
            tap((contacts) => this._contacts.set(contacts))
        );
    }

    clearContacts(): void {
        this._contacts.set([]);
    }

    searchContacts(query: string): Observable<UsuarioDTO[]> {
        return this.userApiService.getUsers(
            { estado: 'A', identificacion: query } // Búsqueda directa por identificación
        ).pipe(
            switchMap((contacts) => {
                // Si se encontraron contactos con la identificación, los retorna
                if (contacts.length > 0) {
                    this._contacts.set(contacts); // Actualiza el signal
                    return of(contacts); // Devuelve los contactos encontrados
                } else {
                    // Si no hay resultados, se realiza la búsqueda general
                    return this.userApiService.getUsers({ estado: 'A' }).pipe(
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
        return this.userApiService.getUsers({
            estado: 'A',
            rol: query,
            filtroParametro: 'A'
        }).pipe(
            tap((contacts) => this._contacts.set(contacts))
        );
    }

    getContactById(query: string): Observable<UsuarioDTO> {
        return this.userApiService.getUserById(query)
        .pipe(
            tap((contacts) => this._contact.set(contacts))
        );
    }
}
