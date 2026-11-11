import {
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { IndicatorDTO } from 'app/accounting/domain/IndicatorDTO';
import { ResultMapDTO } from 'app/accounting/domain/ResultMapDTO';
import { TimeFrame } from 'app/accounting/domain/TimeFrame';
import { IndicatorTargetDTO } from 'app/accounting/domain/IndicatorTargetDTO';
import { IndicadoresService } from 'app/accounting/business/indicadores.service';
import { TemplateService } from 'app/document/service/template.service';
import { UtilsService } from 'app/document/service/utils.service';
import { PedidoVentaDTO } from 'app/document/document.types';
import { DocumentoPlantillaDTO } from 'app/document/document.types';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import { IndicatorTableComponent } from 'app/accounting/components/indicator-table/indicator-table.component';
import { ImageFormatPipe } from 'app/shared/local-image';
import { DropdownComponent } from 'app/shared/components/dropdown/dropdown/dropdown.component';
import { DropdownItemComponent } from 'app/shared/components/dropdown/dropdown-item/dropdown-item.component';

@Component({
  selector: 'indicator-card',
  imports: [ImageFormatPipe, DropdownComponent, DropdownItemComponent],
  templateUrl: './indicator-card.component.html',
})
export class IndicatorCardComponent {
  readonly indicador = input.required<IndicatorDTO>();

  private dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);
  private indicadoresService = inject(IndicadoresService);
  private templateService = inject(TemplateService);
  private utilsService = inject(UtilsService);

  protected selectedPeriod = signal<TimeFrame | undefined>(undefined);
  protected resultado = signal<ResultMapDTO | undefined>(undefined);
  protected loading = signal(false);
  protected error = signal(false);
  protected hoveredRange = signal<IndicatorTargetDTO | null>(null);
  protected lastUpdated = signal<string>('');

  protected readonly activeMetric = computed(() => this.resolveMetric());
  protected readonly activeMetricColor = computed(() => this.activeMetric()?.color ?? '#64748b');
  protected readonly dateLabel = computed(() => this.formatPeriodDate(this.indicador().periodo?.startDate ?? this.selectedPeriod()?.startDate));
  protected readonly valueSuffix = computed(() => this.resolveValueSuffix());
  protected readonly templateActions = computed<DocumentoPlantillaDTO[]>(() => {
    const propertyValues = PlantillaHelper.buscarValorMultiple(
      (this.indicador().propiedades ?? []) as any,
      PlantillaHelper.ACTIONS
    ) ?? [];

    const ids = propertyValues
      .map((item) => item.valor)
      .flatMap((value) => this.parseTemplateValues(value))
      .filter((value): value is string => !!value);

    const templates = ids
      .map((id) => this.templateService.getTemplate(id))
      .filter((template): template is DocumentoPlantillaDTO => !!template);

    return templates;
  });

  ngOnInit(): void {
    this.selectedPeriod.set(this.indicador().periodo);
    this.loadResultado();
  }

  protected accent(): string {
    const keys = this.indicador().llaveTabla || 'pedidos';
    let hash = 0;
    for (let i = 0; i < keys.length; i++) {
      hash = (hash << 5) - hash + keys.charCodeAt(i);
      hash |= 0;
    }
    const palette = ['#1B2A4A', '#0E7C7B', '#3C4B8C', '#C2760C', '#5B6472'];
    return palette[Math.abs(hash) % palette.length];
  }

  protected formatNumber(value: number | null | undefined): string {
    const safeValue = Number(value ?? 0);
    return new Intl.NumberFormat('es-ES').format(safeValue);
  }

  protected formatPeriodDate(value: string | Date | undefined): string {
    if (!value) {
      return 'Sin período';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return 'Sin período';
    }
    return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
  }

  protected resolveMetric(): IndicatorTargetDTO | undefined {
    const metrics = this.indicador().targets ?? [];
    if (!metrics.length) {
      return undefined;
    }

    const currentValue = Number(this.resultado()?.value ?? 0);
    const match = metrics.find((metric) => {
      const lower = typeof metric.valorInferior === 'number' ? metric.valorInferior : Number.NEGATIVE_INFINITY;
      const upper = typeof metric.valorSuperior === 'number' ? metric.valorSuperior : Number.POSITIVE_INFINITY;
      return currentValue >= lower && currentValue <= upper;
    });

    return match ?? metrics[metrics.length - 1];
  }

  protected rangeText(): string {
    const metric = this.resolveMetric();
    if (!metric) {
      return 'Rango sin datos';
    }
    const lower = typeof metric.valorInferior === 'number' ? metric.valorInferior : null;
    const upper = typeof metric.valorSuperior === 'number' ? metric.valorSuperior : null;

    if (lower !== null && upper !== null) {
      return `${this.formatNumber(lower)} – ${this.formatNumber(upper)}`;
    }
    if (lower !== null) {
      return `≥ ${this.formatNumber(lower)}`;
    }
    if (upper !== null) {
      return `≤ ${this.formatNumber(upper)}`;
    }
    return 'Rango libre';
  }

  protected rangeValueLabel(metric: IndicatorTargetDTO | null | undefined): string {
    if (!metric) {
      return 'Sin rango';
    }

    const lower = typeof metric.valorInferior === 'number' ? this.formatNumber(metric.valorInferior) : null;
    const upper = typeof metric.valorSuperior === 'number' ? this.formatNumber(metric.valorSuperior) : null;

    if (lower !== null && upper !== null) {
      return `${lower} - ${upper}`;
    }
    if (lower !== null) {
      return `≥ ${lower}`;
    }
    if (upper !== null) {
      return `≤ ${upper}`;
    }
    return 'Rango libre';
  }

  protected rangeSegments(): Array<{ metric: IndicatorTargetDTO; name: string; color: string; flex: number }> {
    const metrics = this.indicador().targets ?? [];
    if (!metrics.length) {
      return [{
        metric: { nombre: 'Sin rango', valorInferior: null, valorSuperior: null, color: '#cbd5e1' },
        name: 'Sin rango',
        color: '#cbd5e1',
        flex: 1,
      }];
    }
    return metrics.map((metric, index) => ({
      metric,
      name: metric.nombre,
      color: metric.color,
      flex: index === metrics.length - 1 ? 2 : 1,
    }));
  }

  protected markerPosition(): string {
    const metrics = this.indicador().targets ?? [];
    if (!metrics.length) {
      return '';
    }

    const hasRange = metrics.some((metric) => metric.valorInferior !== null || metric.valorSuperior !== null);
    if (!hasRange) {
      return '';
    }

    const activeIndex = metrics.findIndex((metric) => metric.nombre === this.activeMetric()?.nombre);
    const safeIndex = activeIndex >= 0 ? activeIndex : metrics.length - 1;
    return `${((safeIndex + 0.5) / metrics.length) * 100}%`;
  }

  protected progressWidth(): string {
    const metric = this.resolveMetric();
    const value = Number(this.resultado()?.value ?? 0);
    const lower = typeof metric?.valorInferior === 'number' ? metric.valorInferior : null;
    const upper = typeof metric?.valorSuperior === 'number' ? metric.valorSuperior : null;

    if (lower === null || upper === null) {
      return metric ? '72%' : '0%';
    }

    if (upper <= lower) {
      return metric ? '72%' : '0%';
    }

    const ratio = ((value - lower) / (upper - lower)) * 100;
    return `${Math.min(Math.max(ratio, 10), 100)}%`;
  }

  protected resolveValueSuffix(): string {
    const property = this.indicador().propiedades?.find((item) => item.key === 'valorDespues');
    if (!property || property.valor === null || property.valor === undefined) {
      return '';
    }
    const rawValue = typeof property.valor === 'string' ? property.valor : String(property.valor);
    try {
      const parsedValue = JSON.parse(rawValue);
      if (Array.isArray(parsedValue) && parsedValue.length) {
        return String(parsedValue[0]);
      }
      if (typeof parsedValue === 'string') {
        return parsedValue;
      }
      return String(parsedValue ?? '');
    } catch {
      return String(property.valor);
    }
  }

  protected loadResultado(): void {
    const period = this.selectedPeriod() ?? this.indicador().periodo;
    if (!period) {
      this.resultado.set(undefined);
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    this.error.set(false);
    this.indicadoresService
      .getResultadoIndicador(this.indicador().llaveTabla, period)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resultado) => {
          this.resultado.set(resultado);
          this.lastUpdated.set(this.formatLastUpdated());
          this.loading.set(false);
        },
        error: () => {
          this.resultado.set(undefined);
          this.error.set(true);
          this.loading.set(false);
        },
      });
  }

  protected refreshData(): void {
    this.loadResultado();
  }

  protected formatLastUpdated(): string {
    return new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date());
  }

  protected openTemplate(template: DocumentoPlantillaDTO): void {
    const pedidoVenta = new PedidoVentaDTO();
    pedidoVenta.plantilla = template.llaveTabla;
    this.utilsService.modalWithParams(pedidoVenta, true);
  }

  protected openTable(): void {
    this.dialog.open(IndicatorTableComponent, {
      maxWidth: '98vw',
      maxHeight: '100vh',
      disableClose: false,
      data: { indicador: this.indicador() },
    });
  }

  protected parseTemplateValues(value: string | number | boolean | null | undefined): string[] {
    if (value === null || value === undefined || value === '') {
      return [];
    }

    const raw = typeof value === 'string' ? value : String(value);

    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === 'string' && !!item);
      }
    } catch {
      // no-op
    }

    return [raw];
  }

  protected onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/icons/icon-192x192.png';
  }
}
