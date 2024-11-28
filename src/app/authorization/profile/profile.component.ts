import { Component, OnInit, ViewEncapsulation, OnDestroy, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DocumentoPlantillaDTO, PedidoVentaDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { TemplateService } from 'app/modules/full/neuron/service/template.service';
import { UtilsService } from 'app/modules/full/neuron/service/utils.service';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import Swal from 'sweetalert2';
import { AuthenticationService } from 'app/authentication/authentication.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { environment } from 'environments/environment';
import { LoginService } from 'app/authentication/login.service';
import { Subject, takeUntil } from 'rxjs';
import { OrganizacionDTO, UsuarioDTO } from 'app/authentication/authentication.domain';
import { PropiedadDTO } from 'app/shared/shared.domain';

@Component({
  selector: 'profile',
  templateUrl: './profile.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class ProfileComponent implements OnInit, AfterViewInit, OnDestroy {

  private _unsubscribeAll: Subject<any> = new Subject<any>();
  currentApplicationVersion = environment.appVersion;
  signInForm: UntypedFormGroup;

  modules: DocumentoPlantillaDTO[] = [];
  filteredReports: DocumentoPlantillaDTO[] = [];
  filteredModules: DocumentoPlantillaDTO[] = [];
  filterControl: UntypedFormControl = new UntypedFormControl();
  isLoading = false;

  slides = [];

  user: UsuarioDTO;
  isPublicUser
  company: OrganizacionDTO;

  hasLanding = false;
  landing: SafeHtml[];
  headerSection: SafeHtml[];

  tempTemplateOpen;
  tempIdOpen;

  constructor(
    private templateService: TemplateService,
    public _jwtAuth: AuthenticationService,
    private route: ActivatedRoute,
    private router: Router,
    private _utilsService: UtilsService,
    private _formBuilder: UntypedFormBuilder,
    public loginservice: LoginService,
    private domSanitizer: DomSanitizer
  ) {
  }

  ngOnInit(): void { 

    this.signInForm = this._formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', Validators.required]
    });

    this.loginservice.company$
      .pipe((takeUntil(this._unsubscribeAll)))
      .subscribe((company: OrganizacionDTO) => {
        if (!company || !company.llaveTabla) {
          this.company = undefined;
          return;
        }
        this.company = company;
        this.slides = this.loginservice.slides;
        
        this.hasLanding = false;
        const _iHeaders = PlantillaHelper.buscarValorMultiple(company.propiedades, PlantillaHelper.LANDING_PAGE);
        if (_iHeaders &&_iHeaders.length!==0) {
          this.landing = [];
          _iHeaders.forEach((element: PropiedadDTO) => {
            this.landing.push(this.domSanitizer.bypassSecurityTrustHtml(element.valor));
          });
          this.loginservice.isloginView = false;
          this.hasLanding = true;
        }
        const _iFooters = PlantillaHelper.buscarValorMultiple(company.propiedades, PlantillaHelper.HEADER_PAGE);
        if (_iFooters &&_iFooters.length!==0) {
          this.headerSection = [];
          _iFooters.forEach((element: PropiedadDTO) => {
            this.headerSection.push(this.domSanitizer.bypassSecurityTrustHtml(element.valor));
          });
          this.loginservice.isloginView = false;
          this.hasLanding = true;
        }
      });

    // Subscribe to the user service
    this.loginservice.user$
      .pipe((takeUntil(this._unsubscribeAll)))
      .subscribe((user: UsuarioDTO) => {
        if (!user || !user.llaveTabla) {
          this.user = undefined;
          return;
        }
        this.user = user;
      });

    this.templateService.templates$
      .pipe((takeUntil(this._unsubscribeAll)))
      .subscribe({
        next: (value) => {
          this.loadMenu(value);
          if(this.tempTemplateOpen){
            this.openDialog(this.tempTemplateOpen, this.tempIdOpen);
            this.tempTemplateOpen= undefined;
            this.tempIdOpen = undefined;
          }
        }
      });

      this.loginservice.checkTokenIsValid()
      .subscribe((result:boolean) => {
       if(!result) {this.loginservice.getUrlServices();}
      });  

    
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }


  ngAfterViewInit(): void {
    //this._searchText.nativeElement.focus();
    // this.autoSignIn();
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
          this.openDialog(type, params.id)
        } else {
          this.tempTemplateOpen = type;
          this.tempIdOpen = params.id;
        }
      }
    });
  }

  private openDialog(_type, _id){
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
      let newRoute = '/list/' + this.filteredModules[0].llaveTabla;
      this.router.navigate(['/list' + newRoute]);
      this.filterControl.setValue(null);
      this.filterItem();
    }
  }

  toogleShowLogin() {
    this.loginservice.isloginView = !this.loginservice.isloginView;
  }

  signIn(): void {
    // Return if the form is invalid
    if (this.signInForm.invalid) {
      return;
    }
    // Disable the form
    this.signInForm.disable();
    this.isLoading = true;
    // Sign in
    this.loginservice.signin(this.signInForm.value.username, this.signInForm.value.password, null)
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.loginservice.isloginView = false;
          this.signInForm.enable();
          this.signInForm.controls['password'].setValue('');
          const redirectURL = this.route.snapshot.queryParamMap.get('redirectURL') || '/main';
          // Navigate to the redirect url
          this.router.navigateByUrl(redirectURL);
        },
        error: (response) => {
          // Re-enable the form
          this.signInForm.enable();
          this.isLoading = false;
          if (response.startsWith('Por seguridad')) {
            this.router.navigateByUrl('sessions/recover');
          }
        }
      }
      );
  }

}
