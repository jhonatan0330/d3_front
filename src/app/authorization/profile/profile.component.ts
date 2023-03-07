import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { JwtAuthService } from 'app/authentication/jwt-auth.service';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { DocumentoPlantillaDTO, OrganizacionDTO, PedidoVentaDTO, PropiedadDTO, UsuarioAutenticacionDTO, UsuarioOrganizacionDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { ApiService } from 'app/modules/full/neuron/service/api.service';
import { TemplateService } from 'app/modules/full/neuron/service/template.service';
import { UtilsService } from 'app/modules/full/neuron/service/utils.service';
import { Subject, takeUntil, Subscription } from 'rxjs';
import { FormControl, FormGroup, Validators, UntypedFormControl } from '@angular/forms';
import { PlantillaHelper } from 'app/shared/helpers/plantilla-helper';
import Swal from 'sweetalert2';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'profile',
  templateUrl: './profile.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class ProfileComponent implements OnInit, OnDestroy {

  user: User;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  modules: DocumentoPlantillaDTO[] = [];
  filteredModules: DocumentoPlantillaDTO[] = [];
  filterControl: UntypedFormControl = new UntypedFormControl();
  private templateSub: Subscription;
  isLoading = false;

  signinForm: FormGroup;

  filters: string[] = ['Procesos', 'Reportes', 'Modulos', 'Todo'];
  selectedFilter: string = 'Procesos';

  slides = [
    {'image': 'assets/images/pages/profile/cover.jpg'}
  ];

  constructor(
    private apiService: ApiService,
    private templateService: TemplateService,
    public jwtAuth: JwtAuthService,
    private route: ActivatedRoute,
    private router: Router,
    private _utilsService: UtilsService,
    private _userService: UserService
    
  ) {

  }

  ngOnInit(): void {
    // Subscribe to the user service
    this._userService.user$
      .pipe((takeUntil(this._unsubscribeAll)))
      .subscribe((user: User) => {
        this.user = user;
        if (user && user.companyCoverageImage) {
          this.slides = [];
          user.companyCoverageImage.forEach(element => {
            this.slides.push({image: element})
          });
          
        }
      });

    this.templateSub = this.templateService.templates$.subscribe({
      next: (value) => this.loadMenu(value),
    });

    this.signinForm = new FormGroup({
      password: new FormControl('', Validators.required),
    });

  }
  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();

    if (this.templateSub) {
      this.templateSub.unsubscribe();
    }
  }

  

  loadMenu(templates: DocumentoPlantillaDTO[]) {
    this.modules = [];
    // Transform document to MenuItems
    templates.forEach((element) => {
      if (!element.llaveTabla) {
        this.modules.push(element);
        element.estado = 'T';
      }
      if (PlantillaHelper.buscarPropiedad(element.propiedades, PlantillaHelper.PLANTILLA_TIPO_REPORTE)) {
        const reportElement = cloneDeep(element);
        reportElement.estado = 'R';
        this.modules.push(reportElement);
      }
      if (PlantillaHelper.buscarPropiedad(element.propiedades, PlantillaHelper.PERMISO_PLANTILLA_LISTAR_MENU)) {
        element.estado = 'P';
        this.modules.push(element);
      }
    });
    this.filterItem();
    this.conect2Other();
    this.openFormLink();
  }

  filterItem() {
    let value = this.filterControl.value;
    if (!value) { value = ''; }
    let filterType = '';
    if (this.selectedFilter === 'Reportes') { filterType = 'R'; }
    if (this.selectedFilter === 'Modulos') { filterType = 'P'; }
    if (this.selectedFilter === 'Procesos') { filterType = 'T'; }
    this.filteredModules = Object.assign([], this.modules).filter(
      (item) => (item.nombre && item.nombre.toLowerCase().indexOf(value.toLowerCase()) > -1
        && (item.estado && item.estado.indexOf(filterType) > -1))
    );
  }

  /*getTablero() {
    let tableros =[];
    if (this.jwtAuth.company.propiedades) {
      tableros = this.jwtAuth.company.propiedades.filter(x => x.propiedadValor === 'PROP_182');
      for (let i = 0; i < tableros.length; i++) {
        const element = tableros[i];
        element.estado = 'T';
        this.modules.push(element);
      }
    } 
    this.templateService.setTableros(tableros);
  }*/

  conect2Other() {
    if (this.jwtAuth.otherCompany && this.jwtAuth.otherCompany.length !== 0) {
      this.templateService.conectionTemplates = this.jwtAuth.otherCompany;
      for (let i = 0; i < this.templateService.conectionTemplates.length; i++) {
        const element = this.templateService.conectionTemplates[i];
        if (!element.token) {
          this.logInOtherSystem(element);
        } else {
          this.handlerLoginOther(element.token, element.servidorUrl);
        }
      }
    }
  }

  logInOtherSystem(element: OrganizacionDTO, reloadPassword: Boolean = false) {
    this.apiService
      .autenticar(
        this.jwtAuth.user.identificacion,
        element.usuarioSystem,
        element.servidorUrl
      )
      .subscribe({
        next: (auth: UsuarioAutenticacionDTO) => {
          if (reloadPassword) {
            const newKEy = new UsuarioOrganizacionDTO();
            newKEy.organizacion = element.llaveTabla;
            newKEy.usuario = this.jwtAuth.user.llaveTabla;
            newKEy.tokenServer = element.usuarioSystem;
            this.jwtAuth.changePwdOtherSystem(newKEy).subscribe();
          }
          this.handlerLoginOther(auth.token, element.servidorUrl);
        },
        error: () => {
          this.handlerErrorLoginOther(element);
        },
      });
  }

  handlerLoginOther(authToken: string, servidorUrl: string) {
    for (let i = 0; i < this.templateService.conectionTemplates.length; i++) {
      const element = this.templateService.conectionTemplates[i];
      if (element.servidorUrl === servidorUrl) {
        element.token = authToken;
        element.mensajeIngreso = 'Cargando plantillas';
        if (!element.plantillas) {
          this.apiService.listarPlantillas(servidorUrl).subscribe({
            next: (_t: DocumentoPlantillaDTO[]) => {
              this.handlerTemplateOther(_t, servidorUrl);
            },
            error: () => { },
          });
        } else {
        }
      }
    }
  }

  handlerErrorLoginOther(element: OrganizacionDTO) {
    element.usuarioSystem = undefined;
  }

  signin(element: OrganizacionDTO) {
    const signinData = this.signinForm.value;
    element.usuarioSystem = signinData.password;
    this.logInOtherSystem(element, true);
  }

  handlerTemplateOther(
    plantillas: DocumentoPlantillaDTO[],
    servidorUrl: string
  ) {
    for (let i = 0; i < this.templateService.conectionTemplates.length; i++) {
      const element = this.templateService.conectionTemplates[i];
      if (element.servidorUrl === servidorUrl) {
        for (let j = 0; j < plantillas.length; j++) {
          const iPlantilla = plantillas[j];
          iPlantilla.server = servidorUrl;
          if (iPlantilla.reportes) {
            for (let r = 0; r < iPlantilla.reportes.length; r++) {
              const element = iPlantilla.reportes[r];
              if (!element.servidorUrl) { element.servidorUrl = iPlantilla.server; }
            }
          }
        }
        element.plantillas = plantillas;
        element.menuPlantillas = plantillas.filter((item) =>
          PlantillaHelper.buscarPropiedad(item.propiedades, PlantillaHelper.PERMISO_PLANTILLA_LISTAR_MENU)
        );
        element.reportePlantillas = plantillas.filter((item) =>
          PlantillaHelper.buscarPropiedad(
            item.propiedades,
            PlantillaHelper.PLANTILLA_TIPO_REPORTE
          )
        );
        break;
      }
    }
  }

  openFormLink() {
    this.route.params.subscribe((params: Params) => {
      const type = params.type;
      if (type) {
        const plantilla = this.templateService.getTemplate(type, null);
        if (plantilla) {
          const pedidoVenta: PedidoVentaDTO = new PedidoVentaDTO();
          pedidoVenta.plantilla = plantilla.llaveTabla;
          pedidoVenta.serverUrl = plantilla.server;
          const idDocument = params.id;
          if (idDocument) {
            pedidoVenta.llaveTabla = idDocument;
          }
          this._utilsService.modalWithParams(pedidoVenta);
        } else {
          Swal.fire('Autorizacion', 'No tienes permisos para ver este documento.', 'info');
        }
      }
    });
  }

  selectFirst() {
    if (this.filteredModules && this.filteredModules.length != 0) {
      let newRoute = '/list/' + this.filteredModules[0].llaveTabla;
      this.router.navigate(['/list' + newRoute]);
      this.filterControl.setValue(null);
      this.filterItem();
    }
  }

}
