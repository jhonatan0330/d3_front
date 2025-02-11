import { Component, OnInit, ViewEncapsulation, OnDestroy, AfterViewInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DocumentoPlantillaDTO, PedidoVentaDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { TemplateService } from 'app/modules/full/neuron/service/template.service';
import { UtilsService } from 'app/modules/full/neuron/service/utils.service';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import { AuthenticationService } from 'app/authentication/authentication.service';
import { SafeHtml } from '@angular/platform-browser';
import { environment } from 'environments/environment';
import { LoginService } from 'app/authentication/login.service';
import { Subject, takeUntil } from 'rxjs';
import { OrganizacionDTO, UsuarioDTO } from 'app/authentication/authentication.domain';

// import { ScriptService } from './ScriptService';
// const SCRIPT_PATH = 'https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js';
// const SCRIPT_PATH2 = 'https://fs6.softwareparati.com/roa/webpage/202501/temp/js/main.js';
// const SCRIPT_PATH3 = 'https://fs6.softwareparati.com/roa/webpage/202501/temp/js/lenis.min.js';
// const SCRIPT_PATH4 = 'https://fs6.softwareparati.com/roa/webpage/202501/temp/js/ScrollTrigger.min.js';
// const SCRIPT_PATH5 = 'https://fs6.softwareparati.com/roa/webpage/202501/temp/js/gsap.min.js';
// const SCRIPT_PATH6 = 'https://fs6.softwareparati.com/roa/webpage/202501/temp/js/swiper.min.js';
// const SCRIPT_PATH7 = 'https://fs6.softwareparati.com/roa/webpage/202501/temp/js/waypoints.min.js';
// const SCRIPT_PATH8 = 'https://fs6.softwareparati.com/roa/webpage/202501/temp/js/wow.min.js';
// const SCRIPT_PATH9 = 'https://fs6.softwareparati.com/roa/webpage/202501/temp/js/jquery.nice-select.min.js';
// const SCRIPT_PATH10 = 'https://fs6.softwareparati.com/roa/webpage/202501/temp/js/venobox.min.js';

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

  slides: string[] = [];

  user: UsuarioDTO;
  company: OrganizacionDTO;

  hasHTML = false;
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

    // private renderer: Renderer2,
    // private scriptService: ScriptService
  ) {
  }

  ngOnInit(): void {

    // const scriptElement = this.scriptService.loadJsScript(this.renderer, SCRIPT_PATH);
    // scriptElement.onload = (result) => {
    //   console.log('Carga ok del Script: loaded');
    //   console.log(result);

    //   const scriptElement3 = this.scriptService.loadJsScript(this.renderer, SCRIPT_PATH3);
    //   scriptElement3.onload = (result) => {
    //     console.log('Carga ok del Script: 33333');
    //     console.log(result);

    //     const scriptElement4 = this.scriptService.loadJsScript(this.renderer, SCRIPT_PATH4);
    //     scriptElement4.onload = (result) => {
    //       console.log('Carga ok del Script: 4444');
    //       console.log(result);

    //       const scriptElement5 = this.scriptService.loadJsScript(this.renderer, SCRIPT_PATH5);
    //       scriptElement5.onload = (result) => {
    //         console.log('Carga ok del Script: 5555');
    //         console.log(result);

    //         const scriptElement6 = this.scriptService.loadJsScript(this.renderer, SCRIPT_PATH6);
    //         scriptElement6.onload = (result) => {
    //           console.log('Carga ok del Script: 6666');
    //           console.log(result);

    //           const scriptElement7 = this.scriptService.loadJsScript(this.renderer, SCRIPT_PATH7);
    //           scriptElement7.onload = (result) => {
    //             console.log('Carga ok del Script: 7777');
    //             console.log(result);

    //             const scriptElement8 = this.scriptService.loadJsScript(this.renderer, SCRIPT_PATH8);
    //             scriptElement8.onload = (result) => {
    //               console.log('Carga ok del Script: 8888');
    //               console.log(result);

    //               const scriptElement9 = this.scriptService.loadJsScript(this.renderer, SCRIPT_PATH9);
    //               scriptElement9.onload = (result) => {
    //                 console.log('Carga ok del Script: 9999');
    //                 console.log(result);

    //                 const scriptElement10 = this.scriptService.loadJsScript(this.renderer, SCRIPT_PATH10);
    //                 scriptElement10.onload = (result) => {
    //                   console.log('Carga ok del Script: 2222');
    //                   console.log(result);

    //                   const scriptElement2 = this.scriptService.loadJsScript(this.renderer, SCRIPT_PATH2);
    //                   scriptElement2.onload = (result) => {
    //                     console.log('Carga ok del Script: 2222');
    //                     console.log(result);

    //                   }
    //                   scriptElement2.onerror = () => {
    //                     console.log('Error en carga de script2222!');
    //                   }

    //                 }
    //                 scriptElement10.onerror = () => {
    //                   console.log('Error en carga de script2222!');
    //                 }

    //               }
    //               scriptElement9.onerror = () => {
    //                 console.log('Error en carga de script9999!');
    //               }

    //             }
    //             scriptElement8.onerror = () => {
    //               console.log('Error en carga de script8888!');
    //             }

    //           }
    //           scriptElement7.onerror = () => {
    //             console.log('Error en carga de script7777!');
    //           }

    //         }
    //         scriptElement6.onerror = () => {
    //           console.log('Error en carga de script6666!');
    //         }

    //       }
    //       scriptElement5.onerror = () => {
    //         console.log('Error en carga de script5555');
    //       }

    //     }
    //     scriptElement4.onerror = () => {
    //       console.log('Error en carga de script4444!');
    //     }

    //   }
    //   scriptElement3.onerror = () => {
    //     console.log('Error en carga de script3333!');
    //   }

    // }
    // scriptElement.onerror = () => {
    //   console.log('Error en carga de scriptScript!');
    // }

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
          if (this.tempTemplateOpen) {
            this.openDialog(this.tempTemplateOpen, this.tempIdOpen);
            this.tempTemplateOpen = undefined;
            this.tempIdOpen = undefined;
          }
        }
      });

    this.loginservice.checkTokenIsValid()
      .subscribe((result: boolean) => {
        if (!result) { this.loginservice.getUrlServices(); }
      });

    this.loginservice.slides$
      .pipe((takeUntil(this._unsubscribeAll)))
      .subscribe((_slides: []) => {
        this.slides = _slides;
      });

    this.loginservice.landing$
      .pipe((takeUntil(this._unsubscribeAll)))
      .subscribe((_landing: []) => {
        this.landing = _landing;
        if ((this.landing && this.landing.length !== 0) || (this.headerSection && this.headerSection.length !== 0)) this.hasHTML = true;
      });

    this.loginservice.headerSection$
      .pipe((takeUntil(this._unsubscribeAll)))
      .subscribe((_header: []) => {
        this.headerSection = _header;
        if ((this.landing && this.landing.length !== 0) || (this.headerSection && this.headerSection.length !== 0)) this.hasHTML = true;
      });
  }


  ngOnDestroy(): void {
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
      let newRoute = '/list/' + this.filteredModules[0].llaveTabla;
      this.router.navigate(['/list' + newRoute]);
      this.filterControl.setValue(null);
      this.filterItem();
    }
  }

}
