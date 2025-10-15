import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { map, catchError } from 'rxjs/operators';
import { of, BehaviorSubject, throwError, Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { LocalConstants, LocalStoreService } from 'app/shared/local-store.service';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { TemplateService } from 'app/modules/full/neuron/service/template.service';
import { NotificationsService } from 'app/notification/notification.service';
import { ApiService } from 'app/modules/full/neuron/service/api.service';
import { OrganizacionDTO, UsuarioAutenticacionDTO, UsuarioAutenticacionFilterDTO, UsuarioDTO, UsuarioOrganizacionDTO } from './authentication.domain';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import { PedidoVentaDTO, PedidoVentaFilterDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PropiedadDTO } from 'app/shared/shared.domain';

@Injectable({ providedIn: 'root' })
export class LoginService {

  token: string;
  urlService: string;
  private isAuthenticated = false;
  user: UsuarioDTO = new UsuarioDTO();
  user$ = new BehaviorSubject<UsuarioDTO>(this.user);
  returnPath: string;
  company: OrganizacionDTO = new OrganizacionDTO();
  company$ = new BehaviorSubject<OrganizacionDTO>(this.company);
  isAdmin = false;
  //isPublicUser = true;

  slides: string[] = [];
  slides$ = new BehaviorSubject<string[]>(this.slides);
  
  
  landing: SafeHtml[] = [];
  landing$ = new BehaviorSubject<SafeHtml[]>(this.landing);

  headerSection: SafeHtml[] = [];
  headerSection$ = new BehaviorSubject<SafeHtml[]>(this.headerSection);

  constructor(
    private ls: LocalStoreService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private templateService: TemplateService,
    private notificationService: NotificationsService,
    private apiService: ApiService,
    private domSanitizer: DomSanitizer,
    private http: HttpClient
  ) {
    this.route.queryParams.subscribe(
      (params) => (this.returnPath = params['return'] || '/')
    );
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
          this.isAuthenticated = true;
          //Coloque primero la autenticacion ya que la company trae el carrousel y este carrousel necesita el token
          this.setUserAndToken(res, res.organizacion);
          this.setCompany(res.organizacion)
          this.getUserDataFull(res);
          return res;
        }),
        catchError((error) => {
          this.signout();
          return throwError(error);
        })
      );
  }

  private setCompany(_company: OrganizacionDTO) {
    if (_company) {
      this.getCarrousel(_company);
      if (_company.propiedades) {
        this.isAdmin = !PlantillaHelper.isEmpty(_company.propiedades, PlantillaHelper.APP_ADMIN);
        this.templateService.setModules(PlantillaHelper.buscarValorMultiple(_company.propiedades, PlantillaHelper.APP_MODULES));
      }
    }

    if (this.company && this.company.llaveTabla === _company.llaveTabla) {
      //Evito que se vuelva a consultar los template coverad
      return;
    }

    this.company = _company;
    this.company$.next(this.company);
  }

  private getCarrousel(_company: OrganizacionDTO) {
    this.slides = [];
    this.landing = [];
    this.headerSection = [];
    if (_company.propiedades) {
      const backImages = PlantillaHelper.buscarValorMultiple(_company.propiedades, PlantillaHelper.COVERAGE_IMAGE);
      if (backImages) {
        backImages.forEach(element => {
          this.slides.push(element.valor);
        });
      }

      if (PlantillaHelper.buscarValor(_company.propiedades, PlantillaHelper.COVERAGE_TEMPLATE) && this.isAuthenticated) {
        const entity: PedidoVentaFilterDTO = new PedidoVentaFilterDTO();
        entity.plantilla = PlantillaHelper.buscarValor(_company.propiedades, PlantillaHelper.COVERAGE_TEMPLATE);
        this.apiService.listarDocumentos(entity, null).subscribe({
          next: (dataResult: PedidoVentaDTO[]) => {
            if (dataResult) {
              dataResult.forEach(element => {
                this.slides.push(element.imagen);
                this.slides$.next(this.slides);
              });
            }
          },
          error: () => {
          },
        });
      }

      const _iHeaders = PlantillaHelper.buscarValorMultiple(_company.propiedades, PlantillaHelper.LANDING_PAGE);
      if (_iHeaders && _iHeaders.length !== 0) {
        _iHeaders.forEach((element: PropiedadDTO) => {
          this.landing.push(this.domSanitizer.bypassSecurityTrustHtml(element.valor));
        });
      }
      const _iFooters = PlantillaHelper.buscarValorMultiple(_company.propiedades, PlantillaHelper.HEADER_PAGE);
      if (_iFooters && _iFooters.length !== 0) {
        this.headerSection = [];
        _iFooters.forEach((element: PropiedadDTO) => {
          this.headerSection.push(this.domSanitizer.bypassSecurityTrustHtml(element.valor));
        });
      }

    }
    this.slides$.next(this.slides);
    this.landing$.next(this.landing);
    this.headerSection$.next(this.headerSection);
 
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
          this.signin(null, null, tokenLocal).subscribe();
          //}
          return profile;
        }),
        catchError((error) => {
          this.signout();
          return of(error);
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
    if (!this.user) { return; }
    this.apiService.listarPlantillas(null)
      .subscribe((templates) => {
        this.templateService.setTemplates(templates);
      });
  }



  signout() {
    
      this.setUserAndToken(null, null);
      this.templateService.clear();
      this.notificationService.clear();
      this.dialog.closeAll();
      this.router.navigate(['/sign-in']);
    
   
    this.getOrganization();
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

  changePwdOther(user: string,oldPwd: string, newPwd: string, autorizacion: string) {
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

  recoverPassword(identificacion: string, correo: string) {
    const autenticacion = new UsuarioAutenticacionDTO();
    autenticacion.usuarioDTO = new UsuarioDTO();
    autenticacion.usuarioDTO.identificacion = identificacion;
    autenticacion.usuarioDTO.correo = correo;
    return this.http.post<UsuarioOrganizacionDTO>(this.ls.getUrlAccess('/main/solicitarNuevaClave'), autenticacion);
  }

  isLoggedIn(): Boolean {
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
      this.user = authDTO.usuarioDTO;
    } else {
      this.isAuthenticated = false;
      this.token = null;
      this.user = null;
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

  // CU01
  obtenerPrincipalOrganizacion(): Observable<OrganizacionDTO> {
    return this.http.get<OrganizacionDTO>(
      this.ls.getUrlAccess('/main/obtenerPrincipalOrganizacion')
    );
  }

  private _jsonURL = '/assets/conf.xml';

  getURL(): Observable<String> {
    return this.http.get(this._jsonURL, { responseType: 'text' });
  }

  changePictureUser(fileToUpload: File, _server: string): Observable<UsuarioDTO> {
    const endpoint = this.ls.getUrlAccess('/rest/changePicture', _server);
    const formData: FormData = new FormData();
    formData.append('file', fileToUpload, fileToUpload.name);
    return this.http.post<UsuarioDTO>(endpoint, formData);
  }

  getUrlServices() {
    if (this.company && this.company.llaveTabla) {
      this.configureOrganization(this.company);
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
      this.checkTokenIsValid().subscribe();
      //Si no coloco esto se va a crear un ciclo infintio solicitando el token
      //if (!this.isOpenPopOfAuthenticate) { 
        
      //}
    }
  }

}
