import { Injectable, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, catchError } from 'rxjs/operators';
import { of, throwError, Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { LocalConstants, LocalStoreService } from 'app/shared/local-store.service';
import { MatDialog } from '@angular/material/dialog';
import { TemplateService } from 'app/document/service/template.service';
import { NotificationsService } from 'app/notification/notification.api';
import { ApiService } from 'app/document/document.api';
import { OrganizacionDTO, UsuarioAutenticacionAutorizacionDTO, UsuarioAutenticacionDTO, UsuarioAutenticacionFilterDTO, UsuarioDTO } from './authentication.domain';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import { CarouselService } from './carousel.service';
import { DateNotificationService } from './date-notification.service';
import { AuthenticationService } from './authentication.service';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';

@Injectable({ providedIn: 'root' })
export class LoginService {
  private ls = inject(LocalStoreService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private templateService = inject(TemplateService);
  private notificationService = inject(NotificationsService);
  private notificationCenter = inject(NotificationCenterService);
  private apiService = inject(ApiService);
  private carouselService = inject(CarouselService);
  private dateNotificationService = inject(DateNotificationService);
  private authenticationService = inject(AuthenticationService);


  token: string;
  urlService: string;
  private isAuthenticated = false;
  readonly user = signal<UsuarioDTO>(new UsuarioDTO());
  returnPath: string;
  readonly company = signal<OrganizacionDTO>(new OrganizacionDTO());
  isAdmin = false;
  isReader = false;

  readonly slides = this.carouselService.slides;
  readonly landing = this.carouselService.landing;
  readonly headerSection = this.carouselService.headerSection;

  constructor() {
    this.route.queryParams.subscribe(
      (params) => (this.returnPath = params['return'] || '/')
    );
  }

  setDate(date: Date | string | null) {
    this.dateNotificationService.setDate(date);
  }

  clearDate() {
    this.dateNotificationService.clearDate();
  }

  get date() {
    return this.dateNotificationService.date;
  }


  public signin(username: string, password: string, tokenAuto: string, navigateOnError = true) {
    const autenticacion: UsuarioAutenticacionFilterDTO = new UsuarioAutenticacionFilterDTO();
    autenticacion.sesion = username;
    autenticacion.clave = password;
    autenticacion.claveAnterior = `${environment.dateCompile}`;
    if (username != null) { this.ls.setItem(LocalConstants.LOGIN_ID, username); }
    //Esto lo hice porque me estoy autenticando 2 veces, tengo que mejorar esta parte
    if (username === null && password === null) {
      if (!tokenAuto) { return null; };
      const _user = this.getUser()
      if (_user) autenticacion.usuario = _user.llaveTabla;
    }
    return this.authenticationService.authenticate(autenticacion)
      .pipe(
        map((res: UsuarioAutenticacionDTO) => {
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

  public authenticationOK(res: UsuarioAutenticacionDTO) {
    this.isAuthenticated = true;
    //Coloque primero la autenticacion ya que la company trae el carrousel y este carrousel necesita el token
    this.setUserAndToken(res, res.organizacion);
    this.setCompany(res.organizacion)
    this.getUserDataFull(res);
    if (res.token) { this.setTenantToken(this.getCurrentTenantKey(), res.token); }
    if (res) { this.setDate(res.fechaMaxima); } else { this.clearDate(); }
  }

  private setCompany(_company: OrganizacionDTO) {
    if (_company) {
      this.carouselService.loadFromOrganization(_company, this.isAuthenticated);
      if (_company.propiedades) {
        this.isAdmin = !PlantillaHelper.isEmpty(_company.propiedades, PlantillaHelper.APP_ADMIN);
        this.isReader = !PlantillaHelper.isEmpty(_company.propiedades, PlantillaHelper.APP_READER);
        this.templateService.setModules(PlantillaHelper.buscarValorMultiple(_company.propiedades!, PlantillaHelper.APP_MODULES)!);
      }
    }

    if (this.company() && this.company().llaveTabla === _company?.llaveTabla) {
      // se presentaba un bug en los modulos 
      this.company().propiedades = _company.propiedades;
      //Evito que se vuelva a consultar los template coverad
      return;
    }

    this.company.set(_company);
  }



  public checkTokenIsValid(forceRefresh = false, navigateOnError = true) {
    const tokenLocal = this.getJwtToken();
    if (!tokenLocal) { return of(false) };
    if (!this.urlService) {
      this.urlService = this.getConfUrl();
    }
    if (!this.urlService) {
      return of(false);
    }
    // Check if the user is logged in
    if (this.isAuthenticated && !forceRefresh) {
      return of(true);
    }
    const autenticacion: UsuarioAutenticacionFilterDTO = new UsuarioAutenticacionFilterDTO();
    autenticacion.claveAnterior = `${environment.dateCompile}`;
    return this.authenticationService.checkToken(autenticacion)
      .pipe(
        map((data: UsuarioAutenticacionDTO) => {
          this.authenticationOK({
            ...data,
            token: data.token || tokenLocal
          });
          return true;
        }),
        catchError(() => {
          if (navigateOnError) {
            this.signout();
          } else {
            this.isAuthenticated = false;
            this.token = null as any;
          }
          return of(false);
        })
      );
  }

  getUserDataFull(response: UsuarioAutenticacionDTO) {
    // Store the access token in the local storage
    this.token = response.token;
    // Set the authenticated flag to true
    this.isAuthenticated = true;

    if (response && response.mensaje) {

      this.notificationCenter.fire({
        position: 'top-end',
        title: response.mensaje,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      })
    }
    if (!this.user()) { return; }
    this.apiService.listarPlantillas("USER")
      .subscribe({
        next: (templates) => {
          this.templateService.setTemplates(templates);
        }, error: () => { }
      });
  }

  signout() {

    this.clearTenantTokens();
    this.setUserAndToken(null!, null!);
    this.templateService.clear();
    this.notificationService.clear();
    this.dialog.closeAll();
    this.router.navigate(['/sign-in']);

  }

  changePwd(oldPwd: string, newPwd: string, autorizacion: string) {
    const autenticacion: UsuarioAutenticacionDTO = new UsuarioAutenticacionDTO();
    autenticacion.llaveTabla = autorizacion;
    autenticacion.usuario = this.user().llaveTabla;
    autenticacion.claveAnterior = oldPwd;
    autenticacion.clave = newPwd;
    return this.authenticationService.changePassword(autenticacion);
  }

  changePwdOther(user: string, oldPwd: string, newPwd: string, autorizacion: string) {
    const autenticacion: UsuarioAutenticacionDTO = new UsuarioAutenticacionDTO();
    autenticacion.llaveTabla = autorizacion;
    autenticacion.usuario = user;
    autenticacion.claveAnterior = oldPwd;
    autenticacion.clave = newPwd;
    return this.authenticationService.changePassword(autenticacion);
  }


  recoverPassword(identificacion: string, correo: string): Observable<UsuarioAutenticacionAutorizacionDTO> {
    return this.authenticationService.recoverPassword(identificacion, correo);
  }

  isLoggedIn(): boolean {
    if (!this.token) { this.token = this.getJwtToken(); }
    if (!this.token) { return false; }
    if (!this.urlService) { this.urlService = this.getConfUrl(); }
    if (!this.urlService) { return false; }
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


  setUserAndToken(authDTO: UsuarioAutenticacionDTO, _company: OrganizacionDTO) {
    if (authDTO) {
      this.isAuthenticated = true;
      this.token = authDTO.token;
      this.user.set(authDTO.usuarioDTO);
    } else {
      this.isAuthenticated = false;
      this.token = null as any;
      this.user.set(null as any);
    }



    this.ls.setItem(LocalConstants.JWT_TOKEN, this.token);
    this.ls.setItem(LocalConstants.APP_USER, this.user());
  }

  setConfUrl(url: string) {
    if (url.endsWith('/')) {
      url = url.substring(0, url.length - 1);
    }
    this.urlService = url;
    this.ls.setItem(LocalConstants.URL_CONF, url);
  }

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
  }
  



  getURL(): Observable<string> {
    return this.authenticationService.getConfigUrl();
  }

  getUrlServices() {
    if (this.company() && this.company().llaveTabla) {
      this.configureOrganization(this.company());
      return;
    }
    this.ensureBaseUrl().subscribe({
      next: () => {
        this.getOrganization();
      },
      error: () => { }
    });
  }

  ensureBaseUrl(): Observable<string> {
    const configured = this.getConfUrl();
    if (configured) {
      return of(configured);
    }
    return this.getURL().pipe(
      map((data) => {
        if (data !== '' && data !== 'SW42') {
          if (!data.endsWith('/')) {
            data = data + '/';
          }
          this.setConfUrl(data.toString());
        } else {
          this.setConfUrl(location.origin);
        }
        return this.getConfUrl();
      }),
      catchError(() => {
        this.setConfUrl(location.origin);
        return of(location.origin);
      })
    );
  }

  getOrganization() {
    this.authenticationService.getOrganization().subscribe({
      next: (organization) => {
        this.configureOrganization(organization);
      },
      error: () => { }
    });
  }

  configureOrganization(organization: OrganizacionDTO) {
    this.setCompany(organization);
    if (organization && organization.publicToken) {
      this.token = organization.publicToken;
      this.ls.setItem(LocalConstants.JWT_TOKEN, organization.publicToken);
      this.checkTokenIsValid().subscribe({ error: () => { } });
      //Si no coloco esto se va a crear un ciclo infintio solicitando el token
      //if (!this.isOpenPopOfAuthenticate) { 

      //}
    }
  }

  validateAccessModule(pModuleKey: string): boolean {

    if (this.company()) {
      const _modules = PlantillaHelper.buscarValorMultiple(this.company().propiedades, PlantillaHelper.APP_MODULES);
      if (_modules) {
        for (let index = 0; index < _modules.length; index++) {
          const element = _modules[index];
          if (element.valor === pModuleKey) {
            return true;

          }
        }
      }
    }
    return false;
  }

}
