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

@Injectable({ providedIn: 'root' })
export class LoginService {

  isloginView = true;
  token: string;
  urlService: string;
  private isAuthenticated = false;
  user: UsuarioDTO = new UsuarioDTO();
  user$ = new BehaviorSubject<UsuarioDTO>(this.user);
  return: string;
  company: OrganizacionDTO = new OrganizacionDTO();
  company$ = new BehaviorSubject<OrganizacionDTO>(this.company);
  isAdmin = false;
  isPublicUser = true;

  slides:string[] = [];
  slides$ = new BehaviorSubject<string[]>(this.slides);

  constructor(
    private ls: LocalStoreService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private templateService: TemplateService,
    private notificationService: NotificationsService,
    private apiService: ApiService,
    private http: HttpClient
  ) {
    this.route.queryParams.subscribe(
      (params) => (this.return = params['return'] || '/')
    );
  }

  public signin(username: string, password: string, tokenAuto: string) {
    const autenticacion: UsuarioAutenticacionFilterDTO = new UsuarioAutenticacionFilterDTO();
    autenticacion.sesion = username;
    autenticacion.clave = password;
    autenticacion.claveAnterior = `${environment.dateCompile}`;
    //Esto lo hice porque me estoy autenticando 2 veces, tengo que mejorar esta parte
    if (username === null && password === null) {
      if (!tokenAuto) { return null };
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
          this.setCompany(res.organizacion)
          this.setUserAndToken(res);
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
    if (this.company && this.company.llaveTabla === _company.llaveTabla) {
      //Evito que se vuelva a consultar los template coverad
      return;
    }
    this.getCarrousel(_company);
    this.company = _company;
    this.company$.next(this.company);
  }

  private getCarrousel(_company: OrganizacionDTO) {
    this.slides = [];
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
    }
    this.slides$.next(this.slides);
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
      this.isloginView = false;
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
    this.isloginView = false;

    if (response && response.mensaje) {
      Swal.fire({
        position: 'top-end',
        title: response.mensaje,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      })
    }
    if (response.modulos && response.modulos.find((modulo) => modulo.llaveTabla === 'AdministracionLogisticpymes')) {
      this.isAdmin = true;
    } else {
      this.isAdmin = false;
    }
    this.templateService.modulos = response.modulos;
    //if (!this.templateService.template || this.templateService.template.length === 0) {
    if (!this.user) { return; }
    this.apiService.listarPlantillas(null)
      .subscribe(templates => {
        this.templateService.setTemplates(templates);
      });
    //}
  }



  signout() {
    this.isloginView = true;
    this.setUserAndToken(null);
    this.templateService.clear();
    this.notificationService.clear();
    this.dialog.closeAll();
    if (this.company.publicToken) { this.configureOrganization(this.company); }
    this.router.navigate(['/main']);
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


  setUserAndToken(authDTO: UsuarioAutenticacionDTO) {
    if (authDTO) {
      this.isAuthenticated = true;
      this.token = authDTO.token;
      this.user = authDTO.usuarioDTO;
    } else {
      this.isAuthenticated = false;
      this.token = null;
      this.user = null;
    }
    this.isPublicUser = false;
    if (this.user && this.user.llaveTabla) {
      if (PlantillaHelper.buscarValor(this.company.propiedades, PlantillaHelper.PUBLIC_USER)
        && this.user.llaveTabla === PlantillaHelper.buscarValor(this.company.propiedades, PlantillaHelper.PUBLIC_USER)) {
        this.isPublicUser = true;
      }
    } else {
      //Aqui no hay usuario publico y mostramos solo el login
      this.isPublicUser = true;
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
    if (organization.publicToken) {
      this.token = organization.publicToken;
      this.ls.setItem(LocalConstants.JWT_TOKEN, organization.publicToken);
      this.checkTokenIsValid().subscribe();
    }
  }

}
