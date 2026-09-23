import { Component,  effect, AfterViewInit, ChangeDetectionStrategy, DestroyRef, ElementRef, inject, OnDestroy, signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { PedidoVentaDTO } from 'app/document/document.types';
import { TemplateService } from 'app/document/service/template.service';
import { UtilsService } from 'app/document/service/utils.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthenticationApi } from 'app/authentication/authentication.api';
import { IndicatorsCardsComponent } from 'app/accounting/components/indicators-cards';
import { TaskListComponent } from 'app/task/components/task-list/task-list.component';
import { LayoutService } from '../layout.service';
import { CarouselService } from 'app/authentication/business/carousel.service';

@Component({
    selector: 'dashboard',
    templateUrl: './dashboard.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormsModule, ReactiveFormsModule, IndicatorsCardsComponent, TaskListComponent]
})
export class DashboardComponent implements AfterViewInit, OnDestroy {

  readonly layoutservice = inject(LayoutService);
  private readonly carrouselservice = inject(CarouselService);

  private templateService = inject(TemplateService);
  _jwtAuth = inject(AuthenticationApi);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private _utilsService = inject(UtilsService);
  
  private destroyRef = inject(DestroyRef);
  @ViewChild('carouselViewport') private carouselViewport?: ElementRef<HTMLElement>;

  slides: string[] = [];
  readonly activeSlide = signal(0);
  private autoplayId?: ReturnType<typeof setInterval>;

  tempTemplateOpen;
  tempIdOpen;

  constructor() {

    effect(() => {
      this.slides = this.carrouselservice.slides();
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
