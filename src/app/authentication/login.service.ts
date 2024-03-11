import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { map, catchError } from 'rxjs/operators';
import { of, BehaviorSubject, throwError, Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { LocalConstants, LocalStoreService } from 'app/shared/local-store.service';
import { MatDialog } from '@angular/material/dialog';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import { UserService } from 'app/core/user/user.service';
import Swal from 'sweetalert2';
import { TemplateService } from 'app/modules/full/neuron/service/template.service';
import { NotificationsService } from 'app/notification/notification.service';
import { ApiService } from 'app/modules/full/neuron/service/api.service';
import { NavigationService } from 'app/authorization/navigation/navigation.service';
import { OrganizacionDTO, UsuarioAutenticacionDTO, UsuarioAutenticacionFilterDTO, UsuarioDTO, UsuarioOrganizacionDTO } from './authentication.domain';

@Injectable({ providedIn: 'root' })
export class LoginService {

  token: string;
  urlService: string;
  private isAuthenticated = false;
  user: UsuarioDTO = new UsuarioDTO();
  user$ = new BehaviorSubject<UsuarioDTO>(this.user);
  return: string;
  company: OrganizacionDTO;
  isAdmin = false;

  constructor(
    private ls: LocalStoreService,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private _userService: UserService,
    private templateService: TemplateService,
    private notificationService: NotificationsService,
    private apiService: ApiService,
    private _navigationService: NavigationService,
  ) {
    this.route.queryParams.subscribe(
      (params) => (this.return = params['return'] || '/')
    );
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

  public signin(username: string, password: string) {
    const autenticacion: UsuarioAutenticacionFilterDTO = new UsuarioAutenticacionFilterDTO();
    autenticacion.sesion = username;
    autenticacion.clave = password;
    autenticacion.claveAnterior = `${environment.dateCompile}`;
    //Esto lo hice porque me estoy autenticando 2 veces, tengo que mejorar esta parte
    if (username === null && password === null) {
      const tokenLocal = this.getJwtToken();
      if (!tokenLocal) { return null };
      autenticacion.securityToken = tokenLocal;
    }
    return this.http
      .post<UsuarioAutenticacionDTO>(
        this.ls.getUrlAccess('/main/autenticarUsuarioAutenticacion'),
        autenticacion
      )
      .pipe(
        map((res: UsuarioAutenticacionDTO) => {
          this.setUserAndToken(res);
          this.setCompany(res.organizacion);
          this.getUserDataFull(res);
          return res;
        }),
        catchError((error) => {
          this.signout();
          return throwError(error);
        })
      );
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
          if (!this.company) { this.signin(null, null).subscribe(); }
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
    let imageCoverage;
    if (response && response.organizacion && response.organizacion.propiedades) {
      const backImages = PlantillaHelper.buscarValorMultiple(response.organizacion.propiedades, PlantillaHelper.COVERAGE_IMAGE);
      if (backImages) {
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
      avatar: response.usuarioDTO.imagen,
    };

    this._userService.company = {
      companyName: response.organizacion.nombre,
      companySlogan: response.organizacion.slogan,
      companyImage: response.organizacion.imagen,
      companyCoverageImage: (imageCoverage ? imageCoverage : null),
      companyCoverageTemplate: PlantillaHelper.buscarValor(response.organizacion.propiedades, PlantillaHelper.COVERAGE_TEMPLATE)
    }

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
    if (!this.templateService.template || this.templateService.template.length === 0) {
      this.getMenu(response.modulos);
    }
  }


  getMenu(modulos) {
    if (!this.user) { return; }
    /*if (response && response.modulos && response.modulos.length !== 0) {
    }*/
    if (!this.templateService.template || this.templateService.template.length === 0
    ) {
      this.apiService.listarPlantillas(null)
        .subscribe(templates => {
          this.templateService.setTemplates(templates);
          const processToMenu = [];
          // Transform document to MenuItems
          templates.forEach((element) => {
            if (!element.llaveTabla) {
              element.estado = 'T';
              processToMenu.push(element);
            }
          });
          this._navigationService.generate(processToMenu, modulos, templates);
          //this.conect2Other();
        });
    }
  }

  signout() {
    this.setUserAndToken(null);
    this.templateService.clear();
    this.router.navigateByUrl('sign-in');
    this.notificationService.clear();
    this.dialog.closeAll();
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
      this.isAuthenticated = !!authDTO;
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

  setCompany(company: OrganizacionDTO) {
    this.company = company;
  }


}
