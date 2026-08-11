import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { map, catchError } from 'rxjs/operators';
import { of, throwError, Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { LocalConstants, LocalStoreService } from 'app/shared/local-store.service';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { TemplateService } from 'app/modules/full/neuron/service/template.service';
import { NotificationsService } from 'app/notification/notification.service';
import { ApiService } from 'app/modules/full/neuron/service/api.service';
import { OrganizacionDTO, UsuarioAutenticacionAutorizacionDTO, UsuarioAutenticacionDTO, UsuarioAutenticacionFilterDTO, UsuarioDTO, UsuarioOrganizacionDTO } from './authentication.domain';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import { PedidoVentaDTO, PedidoVentaFilterDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { PropiedadDTO } from 'app/shared/shared.domain';

@Injectable({ providedIn: 'root' })
export class LoginService {
  private ls = inject(LocalStoreService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private templateService = inject(TemplateService);
  private notificationService = inject(NotificationsService);
  private apiService = inject(ApiService);
  private http = inject(HttpClient);


  token: string;
  urlService: string;
  private isAuthenticated = false;
  readonly user = signal<UsuarioDTO>(new UsuarioDTO());
  returnPath: string;
  readonly company = signal<OrganizacionDTO>(new OrganizacionDTO());
  isAdmin = false;
  isReader = false;
  //isPublicUser = true;

  readonly slides = signal<string[]>([]);

  // Fecha signal: notifica cambios de fecha a otros componentes
  private readonly _date = signal<Date | null>(null);



  readonly landing = signal<string[]>([]);

  readonly headerSection = signal<string[]>([]);

  constructor() {
    this.route.queryParams.subscribe(
      (params) => (this.returnPath = params['return'] || '/')
    );
  }

  // Public API for date notifications
  setDate(date: Date | string | null) {
    if (!date) {
      this._date.set(null);
      return;
    }
    const newDate = (date instanceof Date) ? date : new Date(date);
    this._date.set(newDate);
  }

  clearDate() {
    this._date.set(null);
  }

  // Signal to read from components
  get date() {
    return this._date.asReadonly();
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
        this.ls.getUrlAccess('/main/autenticarUsuarioAutenticacion'),
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
      this.getCarrousel(_company);
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

  private getCarrousel(_company: OrganizacionDTO) {
    const slides: string[] = [];
    const landing: string[] = [];
    let headerSection: string[] = [];
    if (_company.propiedades) {
      const backImages = PlantillaHelper.buscarValorMultiple(_company.propiedades, PlantillaHelper.COVERAGE_IMAGE);
      if (backImages) {
        backImages.forEach(element => {
          slides.push(element.valor);
        });
      }

      if (PlantillaHelper.buscarValor(_company.propiedades, PlantillaHelper.COVERAGE_TEMPLATE) && this.isAuthenticated) {
        const entity: PedidoVentaFilterDTO = new PedidoVentaFilterDTO();
        entity.plantilla = PlantillaHelper.buscarValor(_company.propiedades, PlantillaHelper.COVERAGE_TEMPLATE);
        this.apiService.listarDocumentos(entity, null!).subscribe({
          next: (dataResult: PedidoVentaDTO[]) => {
            if (dataResult) {
              this.slides.update(current => [...current, ...dataResult.map(element => element.imagen)]);
            }
          },
          error: () => {
          },
        });
      }

      const _iHeaders = PlantillaHelper.buscarValorMultiple(_company.propiedades, PlantillaHelper.LANDING_PAGE);
      if (_iHeaders && _iHeaders.length !== 0) {
        _iHeaders.forEach((element: PropiedadDTO) => {
          landing.push(element.valor);
        });
      }
      const _iFooters = PlantillaHelper.buscarValorMultiple(_company.propiedades, PlantillaHelper.HEADER_PAGE);
      if (_iFooters && _iFooters.length !== 0) {
        headerSection = [];
        _iFooters.forEach((element: PropiedadDTO) => {
          headerSection.push(element.valor);
        });
      }

    }
    this.slides.set(slides);
    this.landing.set(landing);
    this.headerSection.set(headerSection);

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
        this.ls.getUrlAccess('/main/checkToken'),
        autenticacion
      )
      .pipe(
        map((profile: UsuarioAutenticacionDTO) => {
          // Cuando ingreso todavia no tengo organizacion
          //if (!this.company) { 
          this.signin(null!, null!, tokenLocal)!.subscribe({
            next: (data:UsuarioAutenticacionDTO) => {
              this.authenticationOK(data);
            },
            error: () => {}
          }
          );
          return true;
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
        this.ls.getUrlAccess('/main/cambiarClave'),
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

  recoverPassword(identificacion: string, correo: string): Observable<UsuarioAutenticacionAutorizacionDTO> {
    const autenticacion = new UsuarioAutenticacionDTO();
    autenticacion.usuarioDTO = new UsuarioDTO();
    autenticacion.usuarioDTO.identificacion = identificacion;
    autenticacion.usuarioDTO.correo = correo;
    return this.http.post<UsuarioAutenticacionAutorizacionDTO>(this.ls.getUrlAccess('/main/solicitarNuevaClave'), autenticacion);
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
      this.ls.getUrlAccess('/main/obtenerPrincipalOrganizacion')
    );
  }

  private _jsonURL = '/assets/conf.xml';

  getURL(): Observable<string> {
    return this.http.get(this._jsonURL, { responseType: 'text' });
  }

  changePictureUser(fileToUpload: File, _server: string): Observable<UsuarioDTO> {
    const endpoint = this.ls.getUrlAccess('/rest/changePicture', _server);
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
