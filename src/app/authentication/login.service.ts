import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { map, catchError } from 'rxjs/operators';
import { of, throwError, Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { LocalStoreService } from 'app/shared/local-store.service';
import { MatDialog } from '@angular/material/dialog';
import { AuthenticationApi } from './authentication.api';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';
import { UsuarioAutenticacionDTO } from './domain/UsuarioAutenticacionDTO';
import { UsuarioAutenticacionFilterDTO } from './domain/UsuarioAutenticacionFilterDTO';
import { UtilsService } from 'app/document/service/utils.service';
import { LayoutService } from 'app/layout/layout.service';

@Injectable({ providedIn: 'root' })
export class LoginService {
  // Memoria del token
  private readonly ls = inject(LocalStoreService);
  // Al finalizar ir al login
  private router = inject(Router);
  //Para cerrar todos los dialog que puedan estar abiertos
  private dialog = inject(MatDialog);
  // Muestra el pop de cambiar clave
  private readonly _utilsService = inject(UtilsService);
  // Consulta los servicios del dominio Authentication
  private readonly authenticationApi = inject(AuthenticationApi);
  // Muestra la notificacion del tiempo 
  private readonly notificationCenter = inject(NotificationCenterService);
  // Para comunicarle el cambio de usuario
  private readonly layoutService = inject(LayoutService);


  private userAuthentication: UsuarioAutenticacionDTO | null = null;
  private urlService: string | null;
  private token: string | null = null;
  readonly isAuthenticated = signal<boolean>(false);

  public checkTokenIsValid(forceRefresh = false, navigateOnError = true) {
    const tokenLocal = this.ls.getJwtToken();
    if (!tokenLocal) return of(false);
    if (!this.urlService) this.urlService = this.ls.getUrlConf();
    if (!this.urlService) return of(false);
    // Check if the user is logged in
    if (this.isAuthenticated() && !forceRefresh) {
      return of(true);
    }
    const autenticacion: UsuarioAutenticacionFilterDTO = new UsuarioAutenticacionFilterDTO();
    autenticacion.claveAnterior = `${environment.dateCompile}`;
    return this.authenticationApi.checkToken(autenticacion)
      .pipe(map((data: UsuarioAutenticacionDTO) => {
        this.authenticationOK({ ...data, token: data.token || tokenLocal });
        return true;
      }),
        catchError(() => {
          if (navigateOnError) { this.signout(); }
          else {
            this.isAuthenticated.set(false);
            this.token = null;
          }
          return of(false);
        })
      );
  }

  public signin(username: string, password: string, tokenAuto: string | null, navigateOnError = true): Observable<UsuarioAutenticacionDTO> | null {
    const autenticacion: UsuarioAutenticacionFilterDTO = new UsuarioAutenticacionFilterDTO();
    autenticacion.sesion = username;
    autenticacion.clave = password;
    autenticacion.claveAnterior = `${environment.dateCompile}`;
    // if (username != null) { this.ls.setItem(LocalConstants.LOGIN_ID, username); }
    //Esto lo hice porque me estoy autenticando 2 veces, tengo que mejorar esta parte
    if (username === null && password === null) {
      if (!tokenAuto) { return null; }
      //const _user = this.getUser();
      //if (_user) autenticacion.usuario = _user.llaveTabla;
    }
    return this.authenticationApi.authenticate(autenticacion)
      .pipe(
        map((res: UsuarioAutenticacionDTO) => {
          this.authenticationOK(res);
          return res;
        }),
        catchError((error) => {
          if (navigateOnError) {
            this.signout();
          }
          return throwError(() => error);
        })
      );
  }

  private authenticationOK(res: UsuarioAutenticacionDTO) {
    this.userAuthentication = res;
    this.isAuthenticated.set(true);
    this.token = res.token;
    this.layoutService.setUser(res.usuario);

    this.ls.setJwtToken(this.token);
    if (res && res.mensaje) {
      this.notificationCenter.fire({
        position: 'top-end',
        title: res.mensaje,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      })
    }

    //if (res.token) { this.setTenantToken(this.getCurrentTenantKey(), res.token); }

    if (res && res.fechaMaxima) {
      const now = new Date();
      const received = (res.fechaMaxima instanceof Date) ? res.fechaMaxima : new Date(res.fechaMaxima);
      // If the received date is greater than now, show a pop-up
      if (received < now) {
        this._utilsService.modalUserChangePass().subscribe();
      }
      return;
    }
  }

  signout() {
    this.userAuthentication = null;
    //this.clearTenantTokens();
    this.isAuthenticated.set(false);
    this.token = null;
    this.ls.setJwtToken(null);
    this.dialog.closeAll();
    this.router.navigate(['/sign-in']);
  }

  changePwd(oldPwd: string, newPwd: string, autorizacion: string | null): Observable<UsuarioAutenticacionDTO> {

    if (!this.userAuthentication || !this.userAuthentication.usuario) {
      return throwError(() => new Error('No authenticated user'));
    }
    return this.changePwdOther(this.userAuthentication.usuario, oldPwd, newPwd, autorizacion);
  }

  changePwdOther(user: string, oldPwd: string, newPwd: string, autorizacion: string | null): Observable<UsuarioAutenticacionDTO> {
    const autenticacion: UsuarioAutenticacionDTO = new UsuarioAutenticacionDTO();
    if (autorizacion) autenticacion.llaveTabla = autorizacion;
    autenticacion.usuario = user;
    autenticacion.claveAnterior = oldPwd;
    autenticacion.clave = newPwd;
    return this.authenticationApi.changePassword(autenticacion);
  }

  isSameToken() {
    return this.token !== this.ls.getJwtToken();
  }





  /*
  private setTenantToken(tenantKey: string, token: string) {
    if (!tenantKey) { return; }
    const tokens = this.getTenantTokens();
    tokens[tenantKey] = token;
    this.ls.setItem(this.tenantTokensKey(), tokens);
  }

  private getCurrentTenantKey(): string {
    return this.ls.getItem(LocalConstants.TENANT_ID) || 'default';
  }

  private clearTenantTokens() {
    this.ls.setItem(this.tenantTokensKey(), null);
  }

  //Estos 2 metodos estan duplicados en login y en tenant despues los ajusto
  private getTenantTokens(): { [key: string]: string } {
    const tokens = this.ls.getItem(this.tenantTokensKey());
    return tokens && typeof tokens === 'object' ? tokens : {};
  }
  //Estos 2 metodos estan duplicados en login y en tenant despues los ajusto
  private tenantTokensKey(): string {
    const login = this.ls.getItem(LocalConstants.LOGIN_ID);
    return LocalConstants.TENANT_TOKENS_BASE + (login || 'ANON');
  }*/


}
