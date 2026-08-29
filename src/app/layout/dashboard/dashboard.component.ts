import { Component, effect, AfterViewInit, ChangeDetectionStrategy, DestroyRef, inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { PedidoVentaDTO } from 'app/document/model/sw42.domain';
import { TemplateService } from 'app/document/service/template.service';
import { UtilsService } from 'app/document/service/utils.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthenticationService } from 'app/authentication/authentication.service';
import { LoginService } from 'app/authentication/login.service';
import { OrganizacionDTO } from 'app/authentication/authentication.domain';
import { register } from 'swiper/element';
import { IndicatorsCardsComponent } from './cards';

register();

@Component({
    selector: 'dashboard',
    templateUrl: './dashboard.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [FormsModule, ReactiveFormsModule, IndicatorsCardsComponent]
})
export class DashboardComponent implements AfterViewInit {
  private templateService = inject(TemplateService);
  _jwtAuth = inject(AuthenticationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private _utilsService = inject(UtilsService);
  loginservice = inject(LoginService);
  private destroyRef = inject(DestroyRef);

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
        this._utilsService.modalUserChangePass()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({ error: () => {} });
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

  ngAfterViewInit(): void {
    this.openFormLink();
  }

  openFormLink() {
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params: Params) => {
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
