import { Component, OnDestroy, OnInit, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { UserService } from 'app/core/user/user.service';
import { Company, User } from 'app/core/user/user.types';
import { DocumentoPlantillaDTO, PedidoVentaDTO, PedidoVentaFilterDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { TemplateService } from 'app/modules/full/neuron/service/template.service';
import { UtilsService } from 'app/modules/full/neuron/service/utils.service';
import { Subject, takeUntil, Subscription } from 'rxjs';
import { UntypedFormControl } from '@angular/forms';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import Swal from 'sweetalert2';
import { cloneDeep } from 'lodash';
import { AuthenticationService } from 'app/authentication/authentication.service';
import { ApiService } from 'app/modules/full/neuron/service/api.service';

@Component({
  selector: 'profile',
  templateUrl: './profile.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class ProfileComponent implements OnInit, OnDestroy, AfterViewInit {

  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private templateSub: Subscription;

  user: User;
  company: Company;
  modules: DocumentoPlantillaDTO[] = [];
  filteredReports: DocumentoPlantillaDTO[] = [];
  filteredModules: DocumentoPlantillaDTO[] = [];
  filterControl: UntypedFormControl = new UntypedFormControl();
  isLoading = false;

  slides = [
    { 'image': 'assets/images/pages/profile/cover.jpg' }
  ];

  constructor(
    private templateService: TemplateService,
    public jwtAuth: AuthenticationService,
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private _utilsService: UtilsService,
    private _userService: UserService
  ) {
  }

  ngOnInit(): void {
    this._userService.user$
      .pipe((takeUntil(this._unsubscribeAll)))
      .subscribe((user: User) => {
        this.user = user;
      });

    this._userService.company$
      .pipe((takeUntil(this._unsubscribeAll)))
      .subscribe((company: Company) => {
        this.company = company;
        if (company && company.companyCoverageImage) {
          this.slides = [];
          company.companyCoverageImage.forEach(element => {
            this.slides.push({ image: element })
          });
        }
        if( this.company.companyCoverageTemplate){
          const entity: PedidoVentaFilterDTO = new PedidoVentaFilterDTO();
          entity.plantilla = this.company.companyCoverageTemplate;
          this.isLoading = true;
          this.api.listarDocumentos(entity , null).subscribe({
            next: (dataResult: PedidoVentaDTO[]) => {
              if (dataResult) {
                this.slides = [];
                dataResult.forEach(element => {
                  this.slides.push({ image: element.imagen })
                });
                if (company && company.companyCoverageImage) {
                  company.companyCoverageImage.forEach(element => {
                    this.slides.push({ image: element })
                  });
                }
              }
              
              this.isLoading = false;
            },
            error: () => {
              this.isLoading = false;
            },
          });
        }
      });

    this.templateSub = this.templateService.templates$.subscribe({
      next: (value) => this.loadMenu(value),
    });

  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();

    if (this.templateSub) {
      this.templateSub.unsubscribe();
    }
  }

  ngAfterViewInit(): void {
    //this._searchText.nativeElement.focus();
  }

  loadMenu(templates: DocumentoPlantillaDTO[]) {
    this.modules = [];
    if (templates && templates.length!==0) {
      // Transform document to MenuItems
      templates.forEach((element) => {
        if (!element.llaveTabla) {
          this.modules.push(element);
          element.estado = 'T';
        }
        if (PlantillaHelper.buscarPropiedad(element.propiedades, PlantillaHelper.PLANTILLA_TIPO_REPORTE) && PlantillaHelper.buscarPropiedad(element.propiedades, PlantillaHelper.PERMISO_PLANTILLA_CREAR)) {
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
      this.openFormLink();
    }
  }

  filterItem() {
    let value: string = this.filterControl.value;
    if (!value) { value = ''; }
    if (value.endsWith(' ')) { value = value.substring(0, value.length - 1); }
    this.filteredModules = Object.assign([], this.modules).filter(
      (item) => (item.nombre && item.nombre.toLowerCase().indexOf(value.toLowerCase()) > -1
        && (item.estado && item.estado.indexOf('P') > -1))
    );
    this.filteredReports = Object.assign([], this.modules).filter(
      (item) => (item.nombre && item.nombre.toLowerCase().indexOf(value.toLowerCase()) > -1
        && (item.estado && item.estado.indexOf('R') > -1))
    );
  }

  openFormLink() {
    this.route.params.subscribe((params: Params) => {
      const type = params.type;
      if (type) {
        const plantilla = this.templateService.getTemplate(type, null);
        if (plantilla) {
          const pedidoVenta: PedidoVentaDTO = new PedidoVentaDTO();
          pedidoVenta.plantilla = plantilla.llaveTabla;
          pedidoVenta.server = plantilla.server;
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
