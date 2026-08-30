import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { map, catchError, switchMap } from 'rxjs/operators';
import { of, throwError, Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { LocalConstants, LocalStoreService } from 'app/shared/local-store.service';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { TemplateService } from 'app/document/service/template.service';
import { NotificationsService } from 'app/notification/notification.service';
import { ApiService } from 'app/document/service/api.service';
import { OrganizacionDTO, UsuarioAutenticacionAutorizacionDTO, UsuarioAutenticacionDTO, UsuarioAutenticacionFilterDTO, UsuarioDTO, UsuarioOrganizacionDTO } from './authentication.domain';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import { CarouselService } from './carousel.service';
import { DateNotificationService } from './date-notification.service';

@Injectable({ providedIn: 'root' })
export class LoginService {
  private ls = inject(LocalStoreService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private templateService = inject(TemplateService);
  private notificationService = inject(NotificationsService);
  private apiService = inject(ApiService);
  private carouselService = inject(CarouselService);
  private dateNotificationService = inject(DateNotificationService);
  private http = inject(HttpClient);


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


  public signin(username: string, password: string, tokenAuto: string) {
    const autenticacion: UsuarioAutenticacionFilterDTO = new UsuarioAutenticacionFilterDTO();
    autenticacion.sesion = username;
    autenticacion.clave = password;
    autenticacion.claveAnterior = `${environment.dateCompile}`;
    //Esto lo hice porque me estoy autenticando 2 veces, tengo que mejorar esta parte
    if (username === null && password === null) {
      if (!tokenAuto) { return null; };
      const _user = this.getUser()
      if(_user)autenticacion.usuario = _user.llaveTabla;
      autenticacion.securityToken = tokenAuto;
    }
    return this.http
      .post<UsuarioAutenticacionDTO>(
        this.ls.getUrlAccess('/document/main/autenticarUsuarioAutenticacion'),
        autenticacion
      )
      .pipe(
        map((res: UsuarioAutenticacionDTO) => {



          return res;
        }),
        catchError((error) => {
          this.signout();
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
    if(res) {this.setDate(res.fechaMaxima); } else{ this.clearDate(); }
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



  public checkTokenIsValid() {
    const tokenLocal = this.getJwtToken();
    if (!tokenLocal) { return of(false) };
    if (!this.urlService) {
      this.urlService = this.getConfUrl();
    }
    if (!this.urlService) {
      return of(false);
    }
    // Check if the user is logged in
    if (this.isAuthenticated) {
      return of(true);
    }
    const autenticacion: UsuarioAutenticacionFilterDTO = new UsuarioAutenticacionFilterDTO();
    autenticacion.claveAnterior = `${environment.dateCompile}`;
    autenticacion.securityToken = tokenLocal;
    return this.http
      .post<UsuarioAutenticacionDTO>(
        this.ls.getUrlAccess('/document/main/checkToken'),
        autenticacion
      )
      .pipe(
        switchMap((profile: UsuarioAutenticacionDTO) => {
          return this.signin(null!, null!, tokenLocal)!.pipe(
            map((data: UsuarioAutenticacionDTO) => {
              this.authenticationOK(data);
              return true;
            })
          );
        }),
        catchError((error) => {
          this.signout();
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

      Swal.fire({
        position: 'top-end',
        title: response.mensaje,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      })
    }
    if (!this.user()) { return; }
    this.apiService.listarPlantillas("USER")
      .subscribe({ next: (templates) => {
        this.templateService.setTemplates(templates);
      }, error: () => {} });
  }

  signout() {

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
    return this.http
      .post<UsuarioAutenticacionDTO>(
        this.ls.getUrlAccess('/document/main/cambiarClave'),
        autenticacion
      );
  }

  changePwdOther(user: string, oldPwd: string, newPwd: string, autorizacion: string) {
    const autenticacion: UsuarioAutenticacionDTO = new UsuarioAutenticacionDTO();
    autenticacion.llaveTabla = autorizacion;
    autenticacion.usuario = user;
    autenticacion.claveAnterior = oldPwd;
    autenticacion.clave = newPwd;
    return this.http
      .post<UsuarioAutenticacionDTO>(
        this.ls.getUrlAccess('/document/main/cambiarClave'),
        autenticacion
      );
  }


  changePwdOtherSystem(autenticacion: UsuarioOrganizacionDTO) {
    return this.http
      .post<UsuarioOrganizacionDTO>(
        this.ls.getUrlAccess('/document/main/cambiarClaveOtherSystem'),
        autenticacion
      );
  }

  recoverPassword(identificacion: string, correo: string): Observable<UsuarioAutenticacionAutorizacionDTO> {
    const autenticacion = new UsuarioAutenticacionDTO();
    autenticacion.usuarioDTO = new UsuarioDTO();
    autenticacion.usuarioDTO.identificacion = identificacion;
    autenticacion.usuarioDTO.correo = correo;
    return this.http.post<UsuarioAutenticacionAutorizacionDTO>(this.ls.getUrlAccess('/document/main/solicitarNuevaClave'), autenticacion);
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

  // CU01
  obtenerPrincipalOrganizacion(): Observable<OrganizacionDTO> {
    return this.http.get<OrganizacionDTO>(
      this.ls.getUrlAccess('/document/main/obtenerPrincipalOrganizacion')
    );
  }

  private _jsonURL = '/assets/conf.xml';

  getURL(): Observable<string> {
    return this.http.get(this._jsonURL, { responseType: 'text' });
  }

  changePictureUser(fileToUpload: File, _server: string): Observable<UsuarioDTO> {
    const endpoint = this.ls.getUrlAccess('/document/api/changePicture', _server);
    const formData: FormData = new FormData();
    formData.append('file', fileToUpload, fileToUpload.name);
    return this.http.post<UsuarioDTO>(endpoint, formData);
  }

  getUrlServices() {
    if (this.company() && this.company().llaveTabla) {
      this.configureOrganization(this.company());
      return;
    }
    this.getURL().subscribe({
      next: (data) => {
        if (data !== '' && data !== 'SW42') {
          if (!data.endsWith('/')) {
            data = data + '/';
          }
          this.setConfUrl(data.toString());
        } else {
          this.setConfUrl(location.origin);
        }
        this.getOrganization();
      },
      error: () => {
        this.setConfUrl(location.origin);
        this.getOrganization();
      }
    });
  }

  getOrganization() {
    this.obtenerPrincipalOrganizacion().subscribe({
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
      this.checkTokenIsValid().subscribe({ error: () => {} });
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
