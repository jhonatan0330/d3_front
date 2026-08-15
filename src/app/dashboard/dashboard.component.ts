import { Component, effect, OnInit,  OnDestroy, AfterViewInit,  ChangeDetectionStrategy, inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DocumentoPlantillaDTO, PedidoVentaDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { TemplateService } from 'app/modules/full/neuron/service/template.service';
import { UtilsService } from 'app/modules/full/neuron/service/utils.service';
import { FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthenticationService } from 'app/authentication/authentication.service';
import { environment } from 'environments/environment';
import { LoginService } from 'app/authentication/login.service';
import { Subject } from 'rxjs';
import { OrganizacionDTO} from 'app/authentication/authentication.domain';
import { register } from 'swiper/element';

register();

@Component({
    selector: 'dashboard',
    templateUrl: './dashboard.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [FormsModule, ReactiveFormsModule]
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  private templateService = inject(TemplateService);
  _jwtAuth = inject(AuthenticationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private _utilsService = inject(UtilsService);
  private _formBuilder = inject(FormBuilder);
  loginservice = inject(LoginService);


  private _unsubscribeAll: Subject<any> = new Subject<any>();
  currentApplicationVersion = environment.appVersion;
  signInForm: FormGroup;

  modules: DocumentoPlantillaDTO[] = [];
  filterControl: FormControl = new FormControl();
  isLoading = false;

  slides: string[] = [];

  company: OrganizacionDTO | undefined;

  tempTemplateOpen;
  tempIdOpen;

  constructor() {
    effect(() => {
      const company = this.loginservice.company();
      this.company = (company && company.llaveTabla) ? company : undefined;
    });

    effect(() => {
      const date = this.loginservice.date();
      if (!date) { return; }
      const now = new Date();
      const received = (date instanceof Date) ? date : new Date(date);
      // If the received date is greater than now, show a pop-up
      if (received < now) {
        this._utilsService.modalUserChangePass().subscribe({ error: () => {} });
      }
    });

    effect(() => {
      this.slides = this.loginservice.slides();
    });

    effect(() => {
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

  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  ngAfterViewInit(): void {
    this.openFormLink();
  }

  openFormLink() {
    this.route.params.subscribe((params: Params) => {
      const type = params.type;
      if (type) {
        const plantilla = this.templateService.getTemplate(type, null!);
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
    const plantilla = this.templateService.getTemplate(_type, null!);
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

}
