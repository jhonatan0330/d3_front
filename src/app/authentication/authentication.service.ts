import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, of, switchMap, throwError } from 'rxjs';
import { UserService } from 'app/core/user/user.service';
import { UsuarioAutenticacionFilterDTO } from 'app/modules/full/neuron/model/sw42.filter';
import { environment } from 'environments/environment';
import { OrganizacionDTO, UsuarioAutenticacionDTO, UsuarioDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { JwtAuthService } from 'app/authentication/jwt-auth.service';
import { AuthenticationUtils } from './authentication.utils';
import { PlantillaHelper } from 'app/shared/helpers/plantilla-helper';
import { LocalConstants, LocalStoreService } from 'app/shared/local-store.service';

@Injectable()
export class AuthenticationService
{
    private _authenticated: boolean = false;

    token: string;
    urlService: string;
    isAuthenticated = false;
    user: UsuarioDTO = new UsuarioDTO();
    user$ = new BehaviorSubject<UsuarioDTO>(this.user);
    signingIn: Boolean;
    return: string;
    // company: OrganizacionDTO = new OrganizacionDTO();
    isAdmin = false;
    otherCompany: OrganizacionDTO[] ;
    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _userService: UserService,
        private _jwtAuth: JwtAuthService,
        private _ls: LocalStoreService
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
    signIn(credentials: { username: string; password: string }): Observable<any>
    {
        // Throw error, if the user is already logged in
       /* if ( this._authenticated )
        {
            return throwError('User is already logged in.');
        }*/


        const autenticacion: UsuarioAutenticacionFilterDTO = new UsuarioAutenticacionFilterDTO();
        autenticacion.sesion = credentials.username;
        autenticacion.clave = credentials.password;
        autenticacion.claveAnterior = `${environment.dateCompile}`;
        return this._httpClient
          .post<UsuarioAutenticacionDTO>(
            this._ls.getUrlAccess(`${environment.endPoint}`),
            autenticacion
          )
          .pipe(
            switchMap((response: UsuarioAutenticacionDTO) => {
                this.setUserAndToken(response);
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

        let imageCoverage;
        if(response && response.organizacion && response.organizacion.propiedades){
            const backImages  = PlantillaHelper.buscarValorMultiple(response.organizacion.propiedades, PlantillaHelper.COVERAGE_IMAGE);
            if(backImages) {
                imageCoverage = [];
                backImages.forEach(element => {
                    imageCoverage.push(element.valor);
                });
            } 
        }

        // Store the user on the user service
        this._userService.user = {
            id: response.usuarioDTO.llaveTabla,
            name: response.usuarioDTO.nombre,
            number: response.usuarioDTO.identificacion,
            email: response.usuarioDTO.correo,
            company: response.organizacion.imagen,
            companyName: response.organizacion.nombre,
            companySlogan: response.organizacion.slogan,
            companyImage: response.organizacion.imagen,
            avatar: response.usuarioDTO.imagen,
            companyCoverageImage: (imageCoverage?imageCoverage:null)
        };

        

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
        if ( AuthenticationUtils.isTokenExpired(this.accessToken) )
        {
            return of(false);
        }

        // If the access token exists and it didn't expire, sign in using it
        return this.signInUsingToken();
    }

    setUserAndToken(authDTO: UsuarioAutenticacionDTO) {
        if (authDTO) {
          this.isAuthenticated = !!authDTO;
          this.token = authDTO.token;
          this.user = authDTO.usuarioDTO;
          this.otherCompany = authDTO.organizaciones;
        } else {
          this.isAuthenticated = false;
          this.token = null;
          this.user = null;
          this.otherCompany = undefined;
        }
        this.user$.next(this.user);
        this._ls.setItem(LocalConstants.JWT_TOKEN, this.token);
        this._ls.setItem(LocalConstants.APP_USER, this.user);
      }
}
