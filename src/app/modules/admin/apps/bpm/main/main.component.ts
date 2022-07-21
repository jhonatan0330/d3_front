import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  DocumentoPlantillaDTO,
  PedidoVentaDTO,
  PropiedadDTO,
  UsuarioAutenticacionDTO,
} from 'app/model/sw42.domain';

import { Subscription } from 'rxjs';
import { ActivatedRoute, Params } from '@angular/router';
import Swal from 'sweetalert2';
import { ApiService } from 'app/modules/admin/apps/bpm/api.service';
import { TemplateService } from 'app/modules/admin/apps/bpm/template.service';
import { JwtAuthService } from 'app/modules/admin/apps/bpm/jwt-auth.service';
import { UtilsService } from 'app/modules/admin/apps/bpm/utils.service';
import { NotificacionService } from 'app/modules/admin/apps/bpm/notificacion.service';
import { PlantillaHelper } from 'app/modules/admin/apps/bpm/helpers/plantilla-helper';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html'
})
export class MainComponent implements OnInit, OnDestroy {
  modules: DocumentoPlantillaDTO[] = [];
  reports: DocumentoPlantillaDTO[] = [];
  tableros: PropiedadDTO[] = [];
  filteredModules: DocumentoPlantillaDTO[] = [];
  private templateSub: Subscription;
  isLoading = false;

  constructor(
    private apiService: ApiService,
    private templateService: TemplateService,
    public jwtAuth: JwtAuthService,
    private route: ActivatedRoute,
    private utilsService: UtilsService,
    private notificationService: NotificacionService
  ) {}

  ngOnInit(): void {
    this.templateSub = this.templateService.templates$.subscribe({
      next: (value) => this.loadMenu(value),
    });
    this.getMenu();
  }

  ngOnDestroy(): void {
    if (this.templateSub) {
      this.templateSub.unsubscribe();
    }
  }

  getMenu() {
    if (
      !this.templateService.template ||
      this.templateService.template.length === 0
    ) {
      this.isLoading = true;
      this.modules = [];
      this.reports = [];
      this.apiService.listarPlantillas(null).subscribe({
        next: (templates: DocumentoPlantillaDTO[]) => {
          this.templateService.setTemplates(templates);
          this.conect2Other();
          this.openFormLink();
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
    }
  }

  loadMenu(templates: DocumentoPlantillaDTO[]) {
    this.modules = [];
    this.reports = [];
    // Transform document to MenuItems
    templates.forEach((element) => {
      if ( !element.llaveTabla) {
        this.modules.push(element);
      }
      if (
        PlantillaHelper.buscarPropiedad(
          element.propiedades,
          PlantillaHelper.PERMISO_PLANTILLA_LISTAR_MENU
        )
      ) {
        this.modules.push(element);
      }
      if (
        PlantillaHelper.buscarPropiedad(
          element.propiedades,
          PlantillaHelper.PLANTILLA_TIPO_REPORTE
        )
      ) {
        this.reports.push(element);
      }
    });
    this.filteredModules = Object.assign([], this.modules);
    this.getTablero();
  }

  filterItem(value) {
    if (!value) {
      this.filteredModules = Object.assign([], this.modules);
    } // when nothing has typed
    this.filteredModules = Object.assign([], this.modules).filter(
      (item) => item.nombre.toLowerCase().indexOf(value.toLowerCase()) > -1
    );
  }

  getTablero() {
    if(this.jwtAuth.company.propiedades) {
      this.tableros = this.jwtAuth.company.propiedades.filter(x => x.propiedadValor === 'PROP_182');
    } else {
      this.tableros = [];
    }
    this.templateService.setTableros(this.tableros);
  }

  conect2Other() {
    if (this.jwtAuth.otherCompany && this.jwtAuth.otherCompany.length !== 0) {
      this.templateService.conectionTemplates = this.jwtAuth.otherCompany;
      for (let i = 0; i < this.templateService.conectionTemplates.length; i++) {
        const element = this.templateService.conectionTemplates[i];
        if (!element.token) {
          this.apiService
            .autenticar(
              this.jwtAuth.user.identificacion,
              element.usuarioSystem,
              element.servidorUrl
            )
            .subscribe({
              next: (auth: UsuarioAutenticacionDTO) => {
                this.handlerLoginOther(auth.token, element.servidorUrl);
              },
              error: () => {
                this.handlerErrorLoginOther();
              },
            });
        } else {
          this.handlerLoginOther(element.token, element.servidorUrl);
        }
      }
    } else {
      this.notificationService.getNotifications();
    }
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
            error: () => {},
          });
        } else {
        }
      }
    }
  }

  handlerErrorLoginOther() {
    alert('Error de logueo');
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
        }
        element.plantillas = plantillas;
        element.menuPlantillas = plantillas.filter((item) =>
          PlantillaHelper.buscarPropiedad(
            item.propiedades,
            PlantillaHelper.PERMISO_PLANTILLA_LISTAR_MENU
          )
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
    this.notificationService.getNotifications();
  }

  openFormLink() {
    this.route.params.subscribe((params: Params) => {
      const type = params.type;
      if(type){
        const plantilla = this.templateService.getTemplate(type, null);
        if(plantilla){
          const pedidoVenta: PedidoVentaDTO = new PedidoVentaDTO();
          pedidoVenta.plantilla = plantilla.llaveTabla;
          pedidoVenta.serverUrl = plantilla.server;
          const idDocument = params.id;
          if(idDocument){
            pedidoVenta.llaveTabla = idDocument;
          }
          this.utilsService.modalWithParams(pedidoVenta);
        } else {
          Swal.fire('Autorizacion','No tienes permisos para ver este documento.', 'info');
        }
      }
    });
  }

}
