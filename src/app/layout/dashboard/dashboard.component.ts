import { Component, effect, AfterViewInit, ChangeDetectionStrategy, DestroyRef, ElementRef, inject, OnDestroy, signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { PedidoVentaDTO } from 'app/document/document.types';
import { TemplateService } from 'app/document/service/template.service';
import { UtilsService } from 'app/document/service/utils.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthenticationService } from 'app/authentication/authentication.service';
import { LoginService } from 'app/authentication/login.service';
import { OrganizacionDTO } from 'app/authentication/authentication.domain';
import { IndicatorsCardsComponent } from '../../accounting/indicators-cards';

@Component({
    selector: 'dashboard',
    templateUrl: './dashboard.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormsModule, ReactiveFormsModule, IndicatorsCardsComponent]
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  private templateService = inject(TemplateService);
  _jwtAuth = inject(AuthenticationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private _utilsService = inject(UtilsService);
  loginservice = inject(LoginService);
  private destroyRef = inject(DestroyRef);
  @ViewChild('carouselViewport') private carouselViewport?: ElementRef<HTMLElement>;

  slides: string[] = [];
  readonly activeSlide = signal(0);
  private autoplayId?: ReturnType<typeof setInterval>;

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
      this.activeSlide.set(0);
      this.startAutoplay();
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
    this.startAutoplay();
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  nextSlide(): void {
    if (this.slides.length < 2) { return; }
    this.goToSlide((this.activeSlide() + 1) % this.slides.length);
  }

  previousSlide(): void {
    if (this.slides.length < 2) { return; }
    const previousIndex = (this.activeSlide() - 1 + this.slides.length) % this.slides.length;
    this.goToSlide(previousIndex);
  }

  goToSlide(index: number): void {
    if (index < 0 || index >= this.slides.length) { return; }
    this.activeSlide.set(index);
    this.carouselViewport?.nativeElement.scrollTo({
      left: index * this.carouselViewport.nativeElement.clientWidth,
      behavior: 'smooth'
    });
  }

  onCarouselScroll(event: Event): void {
    const viewport = event.target as HTMLElement;
    if (!viewport.clientWidth || !this.slides.length) { return; }
    const index = Math.round(viewport.scrollLeft / viewport.clientWidth);
    this.activeSlide.set(Math.min(index, this.slides.length - 1));
  }

  onCarouselKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.nextSlide();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.previousSlide();
    }
  }

  startAutoplay(): void {
    this.stopAutoplay();
    if (this.slides.length < 2) { return; }
    this.autoplayId = setInterval(() => this.nextSlide(), 5000);
  }

  stopAutoplay(): void {
    if (this.autoplayId) {
      clearInterval(this.autoplayId);
      this.autoplayId = undefined;
    }
  }

  openFormLink() {
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params: Params) => {
      const type = params.type;
      if (type) {
        const plantilla = this.templateService.getTemplate(type);
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
    const plantilla = this.templateService.getTemplate(_type);
    if (plantilla) {
      const pedidoVenta: PedidoVentaDTO = new PedidoVentaDTO();
      pedidoVenta.plantilla = plantilla.llaveTabla;
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
