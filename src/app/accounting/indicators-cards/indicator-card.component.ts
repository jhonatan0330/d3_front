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
import { DropdownComponent } from 'app/shared/components/dropdown/dropdown.component';
import { DropdownItemComponent } from 'app/shared/components/dropdown/dropdown-item.component';
import {
  Accion,
  Indicador,
  IndicadorResultadoDTO,
  PeriodoDTO,
} from 'app/accounting/accounting.types';
import { IndicadoresService } from 'app/accounting/indicators-cards/indicadores.service';
import { UtilsService } from 'app/document/service/utils.service';
import { TemplateService } from 'app/document/service/template.service';
import { PedidoVentaDTO } from 'app/document/document.types';
import { PeriodFilterComponent } from './period-filter.component';
import { IndicatorTableComponent } from './indicator-table.component';
import { ImageFormatPipe } from 'app/shared/local-image';

// Paleta de acento — se asigna por hash de llaveTabla, no por config manual.
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
  template: `
    <div
      class="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
    >
      <!-- Acento superior -->
      <div class="absolute inset-x-0 top-0 h-[3px]" [style.backgroundColor]="accent()"></div>

      <!-- Header -->
      <div class="flex items-center justify-between gap-x-3">
        <div class="flex min-w-0 items-center gap-x-3">
          <span
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
            [style.backgroundColor]="accent() + '14'"
          >
            <img
              class="h-5 w-5 object-contain"
              src="{{ indicador().imagen | imageFormat }}"
              alt=""
              (error)="onImageError($event)"
            />
          </span>
          <div class="min-w-0">
            <div class="truncate text-[13px] font-semibold tracking-tight text-neutral-900 dark:text-white">
              {{ indicador().nombre }}
            </div>
            <div class="text-[11px] text-neutral-500 dark:text-neutral-400">
              {{ selectedPeriodLabel() }}
            </div>
          </div>
        </div>
      </div>

      <!-- Result -->
      <div class="mt-5 flex min-h-[68px] flex-col justify-center">
        @if (loading()) {
          <div class="h-8 w-2/3 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800"></div>
          <div class="mt-2 h-3 w-1/2 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800"></div>

        } @else if (error()) {
          <div class="flex items-start gap-x-2.5">
            <span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 9v4M12 17h.01" />
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
              </svg>
            </span>
            <div class="min-w-0">
              <p class="text-[13px] font-medium text-neutral-700 dark:text-neutral-200">
                No se pudo cargar este indicador
              </p>
              <button
                class="mt-1 text-[12px] font-medium text-neutral-500 underline decoration-neutral-300 underline-offset-2 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                (click)="loadResultado()"
              >
                Reintentar
              </button>
            </div>
          </div>

        } @else if (!resultado() || resultado()?.valor == null) {
          <div class="flex items-start gap-x-2.5">
            <span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 15h6M9 11h6M9 7h3" />
              </svg>
            </span>
            <div class="min-w-0">
              <p class="text-[13px] font-medium text-neutral-700 dark:text-neutral-200">
                Sin datos para este periodo
              </p>
              <p class="mt-0.5 text-[12px] text-neutral-500 dark:text-neutral-400">
                Prueba con otro rango de fechas
              </p>
            </div>
          </div>

        } @else if (resultado(); as r) {
          <div class="flex items-end justify-between gap-x-3">
            <div class="text-[28px] font-semibold leading-none tracking-tight tabular-nums text-neutral-900 dark:text-white">
              {{ r.valor | number }}
            </div>

            @if (delta(r) !== null) {
              <span
                class="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-[12px] font-semibold"
                [class.bg-emerald-50]="delta(r)! >= 0"
                [class.text-emerald-700]="delta(r)! >= 0"
                [class.dark:bg-emerald-500/10]="delta(r)! >= 0"
                [class.dark:text-emerald-400]="delta(r)! >= 0"
                [class.bg-red-50]="delta(r)! < 0"
                [class.text-red-700]="delta(r)! < 0"
                [class.dark:bg-red-500/10]="delta(r)! < 0"
                [class.dark:text-red-400]="delta(r)! < 0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  @if (delta(r)! >= 0) {
                    <path d="M7 17 17 7M7 7h10v10" />
                  } @else {
                    <path d="M7 7 17 17M17 7v10H7" />
                  }
                </svg>
                {{ (delta(r)! | number: '1.0-1') }}%
              </span>
            }
          </div>

          <div class="mt-3 grid grid-cols-2 gap-x-2">
            <div class="rounded-lg bg-neutral-50 px-2.5 py-1.5 dark:bg-neutral-800/60">
              <div class="text-[10px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">Antes</div>
              <div class="text-[13px] font-medium tabular-nums text-neutral-700 dark:text-neutral-200">
                {{ r.valor_antes | number }}
              </div>
            </div>
            <div class="rounded-lg bg-neutral-50 px-2.5 py-1.5 dark:bg-neutral-800/60">
              <div class="text-[10px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">Después</div>
              <div class="text-[13px] font-medium tabular-nums text-neutral-700 dark:text-neutral-200">
                {{ r.valor_despues | number }}
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Actions -->
      <div class="mt-4 flex items-center justify-between gap-x-1 border-t border-neutral-100 pt-3 dark:border-neutral-800">
        <period-filter
          [period]="selectedPeriod()"
          (periodChange)="applyPeriod($event)"
        ></period-filter>

        <div class="flex items-center gap-x-1">
        <button
          class="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-50 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          aria-label="Ver tabla de datos"
          (click)="openTable()"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18" />
            <path d="M3 15h18" />
            <path d="M12 3v18" />
          </svg>
        </button>

        <app-dropdown>
          <button
            trigger
            class="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-50 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            aria-label="Acciones del indicador"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            </svg>
          </button>
          @for (accion of indicador().acciones; track accion.id) {
            <app-dropdown-item (clicked)="onAction(accion)">
              <img
                class="h-5 w-5 shrink-0 object-contain"
                [src]="accion.imagen"
                alt=""
                (error)="onImageError($event)"
              />
              <span>{{ accion.nombre }}</span>
            </app-dropdown-item>
          }
        </app-dropdown>

        <button
          class="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-50 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          aria-label="Recargar datos del indicador"
          (click)="loadResultado()"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M8 16H3v5" />
          </svg>
        </button>
        </div>
      </div>
    </div>
  `,
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
      return null; // evita división por cero (p.ej. Compras en 0)
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