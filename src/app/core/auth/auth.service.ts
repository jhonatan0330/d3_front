import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import { UsuarioAutenticacionFilterDTO } from 'app/model/sw42.filter';
import { environment } from 'environments/environment';
import { UsuarioAutenticacionDTO } from 'app/model/sw42.domain';
import { LocalStoreService } from 'app/shared/services/local-store.service';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { ShortcutsService } from 'app/layout/common/shortcuts/shortcuts.service';
import { ApiService } from 'app/service/api.service';

@Injectable()
export class AuthService
{
    private _authenticated: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _userService: UserService,
        private _jwtAuth: JwtAuthService,
        private _ls: LocalStoreService,
        private _apiService: ApiService,
        private _shortcutsService: ShortcutsService
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string)
    {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string
    {
        return localStorage.getItem('accessToken') ?? '';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any>
    {
        return this._httpClient.post('api/auth/forgot-password', email);
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(password: string): Observable<any>
    {
        return this._httpClient.post('api/auth/reset-password', password);
    }
    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: { email: string; password: string }): Observable<any>
    {
        // Throw error, if the user is already logged in
        if ( this._authenticated )
        {
            return throwError('User is already logged in.');
        }


        const autenticacion: UsuarioAutenticacionFilterDTO = new UsuarioAutenticacionFilterDTO();
        autenticacion.sesion = credentials.email;
        autenticacion.clave = credentials.password;
        autenticacion.claveAnterior = `${environment.dateCompile}`;
        return this._httpClient
          .post<UsuarioAutenticacionDTO>(
            this._ls.getUrlAccess(`${environment.endPoint}`),
            autenticacion
          )
          .pipe(
            switchMap((response: UsuarioAutenticacionDTO) => {
                this.getUserDataFull(response);
                // Return a new observable with the response
                return of(response);
            })
          );

        
    }

    /**
     * Sign in using the access token
     */
    signInUsingToken(): Observable<any>
    {
        const autenticacion: UsuarioAutenticacionFilterDTO = new UsuarioAutenticacionFilterDTO();
        autenticacion.claveAnterior = `${environment.dateCompile}`;
        autenticacion.securityToken = this.accessToken;
        return this._httpClient
        .post<UsuarioAutenticacionDTO>(
            this._ls.getUrlAccess(`${environment.endPoint}`),
            autenticacion
        )
        .pipe(
            catchError(() => {
                // Return false
                this.signOut();
                return of(false)
            }),
            switchMap((response: UsuarioAutenticacionDTO) => {
                if(!response){
                    return of(false);
                }
                this.getUserDataFull(response);
                // Return true
                return of(true);
            })
        );

    }

    getUserDataFull(response: UsuarioAutenticacionDTO){

        // Store the access token in the local storage
        this.accessToken = response.token;

        // Set the authenticated flag to true
        this._authenticated = true;

        // Store the user on the user service
        
        this._userService.user = {
            id: response.usuarioDTO.llaveTabla,
            name: response.usuarioDTO.nombre,
            email: response.usuarioDTO.correo,
            avatar: response.usuarioDTO.imagen
        };

        this._apiService.listarPlantillas(null).subscribe((result)=>{
            this._shortcutsService.addTemplates(result);
        });
    }


    /**
     * Sign out
     */
    signOut(): Observable<any>
    {
        // Remove the access token from the local storage
        localStorage.removeItem('accessToken');

        // Set the authenticated flag to false
        this._authenticated = false;

        // Return the observable
        return of(true);
    }

    /**
     * Sign up
     *
     * @param user
     */
    signUp(user: { name: string; email: string; password: string; company: string }): Observable<any>
    {
        return this._httpClient.post('api/auth/sign-up', user);
    }

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: { email: string; password: string }): Observable<any>
    {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean>
    {

        // Check the access token availability
        if ( !this.accessToken )
        {
            return of(false);
        }

        if (!this._jwtAuth.urlService) {
            this._jwtAuth.urlService = this._jwtAuth.getConfUrl();
        }
        if (!this._jwtAuth.urlService) {
            return of(false);
        }

        // Check if the user is logged in
        if ( this._authenticated )
        {
            return of(true);
        }



        // Check the access token expire date
        if ( AuthUtils.isTokenExpired(this.accessToken) )
        {
            return of(false);
        }

        // If the access token exists and it didn't expire, sign in using it
        return this.signInUsingToken();
    }
}
