import { Component,  effect, AfterViewInit, ChangeDetectionStrategy, DestroyRef, ElementRef, inject, OnDestroy, signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { PedidoVentaDTO } from 'app/document/document.types';
import { TemplateService } from 'app/document/service/template.service';
import { UtilsService } from 'app/document/service/utils.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthenticationApi } from 'app/authentication/authentication.api';
import { TaskListComponent } from 'app/task/components/task-list/task-list.component';
import { LayoutService } from '../layout.service';
import { CarouselService } from 'app/authentication/business/carousel.service';
import { RecentDocumentsCardComponent } from './recent-documents-card/recent-documents-card.component';
import { LastChatCardComponent } from './last-chat-card/last-chat-card.component';
import { QuickActionsComponent } from './indicators/quick-actions.component';

@Component({
    selector: 'dashboard',
    templateUrl: './dashboard.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
      FormsModule,
      ReactiveFormsModule,
      TaskListComponent,
      RecentDocumentsCardComponent,
      LastChatCardComponent,
      QuickActionsComponent,
    ]
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
  readonly defaultCompanyImage = 'assets/images/logo/dark_264x264.png';

  companyImage(): string {
    const imagen = this.layoutservice.company()?.imagen?.trim();
    return imagen ? this.layoutservice.company()!.imagen : this.defaultCompanyImage;
  }

  onCompanyImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img && !img.src.endsWith('dark_264x264.png')) {
      img.src = this.defaultCompanyImage;
    }
  }

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


  readonly alertasStock = [
    {
      id: 'alerta-1',
      severidad: 'critica' as const,
      titulo: 'Pollos Crudos en Marinado',
      mensaje: 'Quedan 12 unidades. Se agotan en ~1.5 horas.',
    },
    {
      id: 'alerta-2',
      severidad: 'advertencia' as const,
      titulo: 'Cajas para Llevar / Empaques',
      mensaje: 'Stock bajo: 25 cajas biodegradables restantes.',
    },
    {
      id: 'alerta-3',
      severidad: 'info' as const,
      titulo: 'Gaseosa Colombiana 1.5L',
      mensaje: 'Solo 4 botellas frías en exhibidor.',
    },
  ];

  readonly canalesAtencion = [
    { nombre: 'Mesa (Comedor)', valor: 820000, pctTotal: 44, icono: '🍽️', color: '#3B82F6' },
    { nombre: 'Domicilios Pío', valor: 630000, pctTotal: 34, icono: '🚲', color: '#10B981' },
    { nombre: 'Llevar / Mostrador', valor: 400000, pctTotal: 22, icono: '🛒', color: '#F59E0B' },
  ];

  readonly rendimientoPersonal = [
    { codigo: 'C1', nombre: 'Caja Principal (Luz Marina)', transacciones: 68, ventas: 940000, estado: 'cuadre_ok' as const },
    { codigo: 'M2', nombre: 'Mesero 2 (Javier P.)', transacciones: 45, ventas: 520000, estado: 'sin_propina' as const },
    { codigo: 'DOM', nombre: 'Caja Domicilios (WhatsApp/Tel)', transacciones: 29, ventas: 390000, estado: 'alerta' as const },
  ];

  readonly productosRotacion = [
    { nombre: 'Pollo Asado Entero + Papa y Arepa', unidades: 54, pct: 42, color: '#F97316' },
    { nombre: 'Medio Pollo Asado', unidades: 38, pct: 28, color: '#EA580C' },
    { nombre: 'Consomé de Menudencias / Sopa del día', unidades: 62, pct: 0, color: '#D97706' },
    { nombre: 'Porción de Papa Criolla / Yuca', unidades: 89, pct: 0, color: '#10B981' },
    { nombre: 'Gaseosa 1.5L / Postobón - CocaCola', unidades: 45, pct: 0, color: '#2563EB' },
  ];

}
