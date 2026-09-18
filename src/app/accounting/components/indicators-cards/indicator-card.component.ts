import { DecimalPipe } from '@angular/common';
import {
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { DropdownComponent } from 'app/shared/components/dropdown/dropdown/dropdown.component';
import { DropdownItemComponent } from 'app/shared/components/dropdown/dropdown-item/dropdown-item.component';
import {
  Accion,
  Indicador,
  IndicadorResultadoDTO,
  PeriodoDTO,
} from 'app/accounting/domain/accounting.types';
import { IndicadoresService } from 'app/accounting/indicators-cards/indicadores.service';
import { UtilsService } from 'app/document/service/utils.service';
import { TemplateService } from 'app/document/service/template.service';
import { PedidoVentaDTO } from 'app/document/document.types';
import { PeriodFilterComponent } from './period-filter.component';
import { IndicatorTableComponent } from './indicator-table.component';
import { ImageFormatPipe } from 'app/shared/local-image';

const ACCENT_PALETTE = ['#1B2A4A', '#0E7C7B', '#3C4B8C', '#C2760C', '#5B6472'];

function accentFor(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  return ACCENT_PALETTE[Math.abs(hash) % ACCENT_PALETTE.length];
}

@Component({
  selector: 'indicator-card',
  imports: [
    DecimalPipe,
    DropdownComponent,
    DropdownItemComponent,
    PeriodFilterComponent,
    ImageFormatPipe,
  ],
  templateUrl: './indicator-card.component.html',
})
export class IndicatorCardComponent implements OnInit {
  readonly indicador = input.required<Indicador>();

  private destroyRef = inject(DestroyRef);
  private dialog = inject(MatDialog);
  private indicadoresService = inject(IndicadoresService);
  private utilsService = inject(UtilsService);
  private templateService = inject(TemplateService);

  protected selectedPeriod = signal<PeriodoDTO | undefined>(undefined);
  protected resultado = signal<IndicadorResultadoDTO | undefined>(undefined);
  protected loading = signal(false);
  protected error = signal(false);

  ngOnInit(): void {
    this.selectedPeriod.set(this.indicador().periodo);
    this.loadResultado();
  }

  protected accent(): string {
    return accentFor(this.indicador().llaveTabla);
  }

  protected selectedPeriodLabel(): string {
    const period = this.selectedPeriod();
    if (!period || !period.fechaInicial || period.nivel === 'full') {
      return 'Todo';
    }
    return period.fechaInicial + ' — ' + period.fechaFinal;
  }

  protected delta(r: IndicadorResultadoDTO): number | null {
    if (!r.valor_antes) {
      return null;
    }
    return ((r.valor_despues - r.valor_antes) / r.valor_antes) * 100;
  }

  protected loadResultado(): void {
    const period = this.selectedPeriod();
    if (!period) {
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
          this.loading.set(false);
        },
        error: () => {
          this.resultado.set(undefined);
          this.error.set(true);
          this.loading.set(false);
        },
      });
  }

  protected applyPeriod(period: PeriodoDTO): void {
    this.selectedPeriod.set(period);
    this.loadResultado();
  }

  protected openTable(): void {
    this.dialog.open(IndicatorTableComponent, {
      maxWidth: '98vw',
      maxHeight: '100vh',
      disableClose: false,
      data: { indicador: this.indicador() },
    });
  }

  protected onAction(accion: Accion): void {
    const template = this.templateService.getTemplate(accion.plantilla);
    const pedidoVenta = new PedidoVentaDTO();
    pedidoVenta.plantilla = accion.plantilla;
    this.utilsService.modalWithParams(pedidoVenta, true);
  }

  protected onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/icons/icon-192x192.png';
  }
}
