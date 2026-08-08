import { Component, effect, OnInit,  OnDestroy, AfterViewInit,  ChangeDetectionStrategy, inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DocumentoPlantillaDTO, PedidoVentaDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { TemplateService } from 'app/modules/full/neuron/service/template.service';
import { UtilsService } from 'app/modules/full/neuron/service/utils.service';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import { AuthenticationService } from 'app/authentication/authentication.service';
import { environment } from 'environments/environment';
import { LoginService } from 'app/authentication/login.service';
import { Subject } from 'rxjs';
import { OrganizacionDTO, UsuarioDTO } from 'app/authentication/authentication.domain';
import { NgClass } from '@angular/common';
import { MatCard } from '@angular/material/card';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { TemplateComponent } from './template/template.component';
import { ImageFormatPipe } from '../../shared/local-image';


interface MenuNode {
    section: string ;
    sectionKey: string ;
    children?: DocumentoPlantillaDTO[];
    visible: boolean;
    image: string;
}

@Component({
    selector: 'profile',
    templateUrl: './profile.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [NgClass, MatCard, MatFormField, MatInput, FormsModule, ReactiveFormsModule, TemplateComponent, ImageFormatPipe]
})
export class ProfileComponent implements OnInit, AfterViewInit, OnDestroy {
  private templateService = inject(TemplateService);
  _jwtAuth = inject(AuthenticationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private _utilsService = inject(UtilsService);
  private _formBuilder = inject(UntypedFormBuilder);
  loginservice = inject(LoginService);


  private _unsubscribeAll: Subject<any> = new Subject<any>();
  currentApplicationVersion = environment.appVersion;
  signInForm: UntypedFormGroup;

  modules: DocumentoPlantillaDTO[] = [];
  filteredReports: DocumentoPlantillaDTO[] = [];
  filteredModules: MenuNode[] = [];
  filterControl: UntypedFormControl = new UntypedFormControl();
  isLoading = false;

  activeTab: 'menu' | 'metrics' = 'menu';

  slides: string[] = [];

  user: UsuarioDTO;
  company: OrganizacionDTO;

  tempTemplateOpen;
  tempIdOpen;

  constructor() {
    effect(() => {
      const company = this.loginservice.company();
      this.company = (company && company.llaveTabla) ? company : undefined;
    });

    effect(() => {
      const user = this.loginservice.user();
      this.user = (user && user.llaveTabla) ? user : undefined;
    });

    effect(() => {
      const date = this.loginservice.date();
      if (!date) { return; }
      const now = new Date();
      const received = (date instanceof Date) ? date : new Date(date);
      // If the received date is greater than now, show a pop-up
      if (received < now) {
        this._utilsService.modalUserChangePass().subscribe();
      }
    });

    effect(() => {
      this.slides = this.loginservice.slides();
    });

    effect(() => {
      const value = this.templateService.template();
      this.loadMenu(value);
      if (this.tempTemplateOpen) {
        this.openDialog(this.tempTemplateOpen, this.tempIdOpen);
        this.tempTemplateOpen = undefined;
        this.tempIdOpen = undefined;
      }
    });
  }

  ngOnInit(): void {

    this.signInForm = this._formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', Validators.required]
    });

      // Se esta duiplicando el llamado del check
   /* this.loginservice.checkTokenIsValid()
      .subscribe((result: boolean) => {
        if (!result) { this.loginservice.getUrlServices(); }
      });*/
  }


  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }


  ngAfterViewInit(): void {
    this.openFormLink();
  }

  loadMenu(templates: DocumentoPlantillaDTO[]) {
    this.modules = [];
    if (templates && templates.length !== 0) {
      // Transform document to MenuItems
      templates.forEach((element) => {
        if (!element.llaveTabla) {
          this.modules.push(element);
          element.estado = 'T';
        }
        if (PlantillaHelper.buscarPropiedad(element.propiedades, PlantillaHelper.PLANTILLA_TIPO_REPORTE) && PlantillaHelper.buscarPropiedad(element.propiedades, PlantillaHelper.PERMISO_PLANTILLA_CREAR)) {
          const reportElement = new DocumentoPlantillaDTO();
          reportElement.llaveTabla = element.llaveTabla;
          reportElement.nombre = element.nombre;
          reportElement.imagen = element.imagen;
          reportElement.proceso = element.proceso;
          reportElement.server = element.server;
          reportElement.estado = 'R';
          this.modules.push(reportElement);
        }
        if (PlantillaHelper.buscarPropiedad(element.propiedades, PlantillaHelper.PERMISO_PLANTILLA_LISTAR_MENU)) {
          element.estado = 'P';
          this.modules.push(element);
        }
      });
      this.filterItem();
    }
  }

  filterItem() {
    let value: string = this.filterControl.value;
    if (!value) { value = ''; }
    if (value.endsWith(' ')) { value = value.substring(0, value.length - 1); }
    const _moduleFilter  = Object.assign([], this.modules).filter(
      (item) => (
        ((item.nombre && item.nombre.toLowerCase().indexOf(value.toLowerCase()) > -1) || (item.codigo && item.codigo.toLowerCase() === value.toLowerCase()))
        && (item.estado && item.estado.indexOf('P') > -1))
    );
    this.filteredModules = [];
    _moduleFilter.forEach((_iFilterModule)=>{
      let _flagFind = false;
      this.filteredModules.forEach((_iFilterMenu)=>{
        if(_iFilterMenu.sectionKey === PlantillaHelper.buscarPropiedad( _iFilterModule.propiedades, PlantillaHelper.PERMISO_PLANTILLA_LISTAR_MENU).valor){
          if(!_iFilterMenu.children) _iFilterMenu.children = [];
          _iFilterMenu.children.push(_iFilterModule);
          _flagFind = true;
        }
      });
      if(!_flagFind){
        this.filteredModules.push({
          section: PlantillaHelper.buscarPropiedad( _iFilterModule.propiedades, PlantillaHelper.PERMISO_PLANTILLA_LISTAR_MENU).texto,
          sectionKey: PlantillaHelper.buscarPropiedad( _iFilterModule.propiedades, PlantillaHelper.PERMISO_PLANTILLA_LISTAR_MENU).valor,
          children:[_iFilterModule],
          visible: (value || this.filteredModules.length===0)?true:false,
          image: _iFilterModule.imagen
        });
      }
    });

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
          this.openDialog(type, params.id)
        } else {
          this.tempTemplateOpen = type;
          this.tempIdOpen = params.id;
        }
      }
    });
  }

  private openDialog(_type, _id) {
    const plantilla = this.templateService.getTemplate(_type, null);
    if (plantilla) {
      const pedidoVenta: PedidoVentaDTO = new PedidoVentaDTO();
      pedidoVenta.plantilla = plantilla.llaveTabla;
      pedidoVenta.server = plantilla.server;
      const idDocument = _id;
      if (idDocument) {
        pedidoVenta.llaveTabla = idDocument;
      }
      this._utilsService.modalWithParams(pedidoVenta, true);

      this.router.navigate(['/main'], {
        queryParams: {
          'type': null,
          'id': null,
        },
        queryParamsHandling: 'merge'
      });
    }
  }

  selectFirst() {
    if (this.filteredModules && this.filteredModules.length != 0) {
      let newRoute = '/list/' + this.filteredModules[0].children[0].llaveTabla;
      this.router.navigate(['/list' + newRoute]);
      this.filterControl.setValue(null);
      this.filterItem();
    }
  }

  toogleSection(pMenu:MenuNode){
    this.filteredModules.forEach((_iFilterMenu)=>{
      if(_iFilterMenu.sectionKey === pMenu.sectionKey){
        _iFilterMenu.visible = !_iFilterMenu.visible;
        return;
      }
    });
  }

}
