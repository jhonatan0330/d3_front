import { Injectable } from '@angular/core';
import { LocalStoreService, LocalConstants } from '../shared/services/local-store.service';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { map, catchError } from 'rxjs/operators';
import {
  UsuarioDTO,
  UsuarioAutenticacionDTO,
  OrganizacionDTO,
  UsuarioOrganizacionDTO,
} from 'app/modules/full/neuron/model/sw42.domain';
import {
  UsuarioAutenticacionFilterDTO,
} from 'app/modules/full/neuron/model/sw42.filter';
import { of, BehaviorSubject, throwError } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root',
})
export class JwtAuthService {
  token: string;
  urlService: string;
  isAuthenticated = false;
  user: UsuarioDTO = new UsuarioDTO();
  user$ = new BehaviorSubject<UsuarioDTO>(this.user);
  signingIn: Boolean;
  return: string;
  company: OrganizacionDTO = new OrganizacionDTO();
  isAdmin = false;
  otherCompany: OrganizacionDTO[] ;

  constructor(
    private ls: LocalStoreService,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.route.queryParams.subscribe(
      (params) => (this.return = params['return'] || '/')
    );
  }

  public signin(username: string, password: string) {
    this.signingIn = true;
    const autenticacion: UsuarioAutenticacionFilterDTO = new UsuarioAutenticacionFilterDTO();
    autenticacion.sesion = username;
    autenticacion.clave = password;
    autenticacion.claveAnterior = `${environment.dateCompile}`;
    return this.http
      .post<UsuarioAutenticacionDTO>(
        this.ls.getUrlAccess(`${environment.endPoint}`),
        autenticacion
      )
      .pipe(
        map((res: UsuarioAutenticacionDTO) => {
          this.setUserAndToken(res);
          this.signingIn = false;
          return res;
        }),
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  /*
    checkTokenIsValid is called inside constructor of
    shared/components/layouts/admin-layout/admin-layout.component.ts
  */
  public checkTokenIsValid() {

    const tokenLocal = this.getJwtToken();
    if(!tokenLocal) {return of()};
    const autenticacion: UsuarioAutenticacionFilterDTO = new UsuarioAutenticacionFilterDTO();
    autenticacion.claveAnterior = `${environment.dateCompile}`;
    autenticacion.securityToken = tokenLocal;
    return this.http
      .post<UsuarioAutenticacionDTO>(
        this.ls.getUrlAccess(`${environment.endPoint}`),
        autenticacion
      )
      .pipe(
        map((profile: UsuarioAutenticacionDTO) => {
          this.setUserAndToken(profile);
          this.setCompany(profile.organizacion);
          return profile;
        }),
        catchError((error) => {
          this.signout();
          return of(error);
        })
      );
  }

  signout() {
    this.setUserAndToken(null);
    this.router.navigateByUrl('sign-in');
  }

  changePwd(oldPwd: string, newPwd: string, autorizacion: string) {
    const autenticacion: UsuarioAutenticacionDTO = new UsuarioAutenticacionDTO();
    autenticacion.llaveTabla = autorizacion;
    autenticacion.usuario = this.user.llaveTabla;
    autenticacion.claveAnterior = oldPwd;
    autenticacion.clave = newPwd;
    return this.http
      .post<UsuarioAutenticacionDTO>(
        this.ls.getUrlAccess('/main/cambiarClave'),
        autenticacion
      );
  }

  changePwdOtherSystem(autenticacion: UsuarioOrganizacionDTO) {
    return this.http
      .post<UsuarioOrganizacionDTO>(
        this.ls.getUrlAccess('/main/cambiarClaveOtherSystem'),
        autenticacion
      );
  }

  recoverPassword(identificacion: string, correo : string) {
    const autenticacion = new UsuarioAutenticacionDTO();
    autenticacion.usuarioDTO = new UsuarioDTO();
    autenticacion.usuarioDTO.identificacion = identificacion;
    autenticacion.usuarioDTO.correo = correo;
    return this.http
      .post<UsuarioOrganizacionDTO>(
        this.ls.getUrlAccess('/main/solicitarNuevaClave'),
        autenticacion
      );
  }

  isLoggedIn(): Boolean {
    if (!this.token) {
      this.token = this.getJwtToken();
    }
    if (!this.token) {
      return false;
    }
    if (!this.urlService) {
      this.urlService = this.getConfUrl();
    }
    if (!this.urlService) {
      return false;
    }
    return true;
  }

  getJwtToken() {
    return this.ls.getItem(LocalConstants.JWT_TOKEN);
  }

  getConfUrl() {
    return this.ls.getItem(LocalConstants.URL_CONF);
  }

  getUser() {
    return this.ls.getItem(LocalConstants.APP_USER);
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
    this.ls.setItem(LocalConstants.JWT_TOKEN, this.token);
    this.ls.setItem(LocalConstants.APP_USER, this.user);
  }

  setConfUrl(url: string) {
    if (url.endsWith('/')) {
      url = url.substring(0, url.length - 1);
    }
    this.urlService = url;
    this.ls.setItem(LocalConstants.URL_CONF, url);
  }

  setCompany(company: OrganizacionDTO) {
    this.company = company;
  }
}
