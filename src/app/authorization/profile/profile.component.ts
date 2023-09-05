import { Component, OnDestroy, OnInit, AfterViewInit,  ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { JwtAuthService } from 'app/authentication/jwt-auth.service';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { DocumentoPlantillaDTO, PedidoVentaDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { TemplateService } from 'app/modules/full/neuron/service/template.service';
import { UtilsService } from 'app/modules/full/neuron/service/utils.service';
import { Subject, takeUntil, Subscription } from 'rxjs';
import {  UntypedFormControl } from '@angular/forms';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import Swal from 'sweetalert2';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'profile',
  templateUrl: './profile.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class ProfileComponent implements OnInit, OnDestroy, AfterViewInit {

  user: User;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  modules: DocumentoPlantillaDTO[] = [];
  filteredReports: DocumentoPlantillaDTO[] = [];
  filteredModules: DocumentoPlantillaDTO[] = [];
  filterControl: UntypedFormControl = new UntypedFormControl();
  private templateSub: Subscription;
  isLoading = false;

  slides = [
    { 'image': 'assets/images/pages/profile/cover.jpg' }
  ];

  constructor(
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
            this.slides.push({ image: element })
          });

        }
      });

    this.templateSub = this.templateService.templates$.subscribe({
      next: (value) => this.loadMenu(value),
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

  ngAfterViewInit(): void {
    //this._searchText.nativeElement.focus();
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
    this.openFormLink();
  }

  filterItem() {
    let value:string = this.filterControl.value;
    if (!value) { value = ''; }
    if (value.endsWith(' ')) { value = value.substring(0,value.length -1);}
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
