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
  IndicadoresService,
  Periodo,
  ResultadoIndicador,
} from 'app/layout/dashboard/indicadores.service';
import { UtilsService } from 'app/document/service/utils.service';
import { TemplateService } from 'app/document/service/template.service';
import { PedidoVentaDTO } from 'app/document/model/sw42.domain';
import { PeriodFilterComponent } from './period-filter.component';
import { IndicatorTableComponent } from './indicator-table.component';

@Component({
  selector: 'indicator-card',
  imports: [
    DecimalPipe,
    DropdownComponent,
    DropdownItemComponent,
    PeriodFilterComponent,
  ],
  template: `
    <div
      class="flex flex-col rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-none dark:hover:border-neutral-700"
    >
      <!-- Header -->
      <div class="flex items-center justify-between gap-x-3">
        <div class="flex min-w-0 items-center gap-x-3">
          <span
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-neutral-100 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800"
          >
            <img
              class="h-6 w-6 object-contain"
              [src]="indicador().icono"
              alt=""
              (error)="onImageError($event)"
            />
          </span>
          <div class="min-w-0">
            <div
              class="truncate text-sm font-semibold tracking-tight text-neutral-900 dark:text-white"
            >
              {{ indicador().nombre }}
            </div>
            <div class="text-xs text-neutral-500 dark:text-neutral-400">
              {{ selectedPeriodLabel() }}
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-x-1">
          <!-- Period filter -->
          <period-filter
            [period]="selectedPeriod()"
            (periodChange)="applyPeriod($event)"
          ></period-filter>

          <!-- Table -->
          <button
            class="rounded-lg border border-neutral-200 bg-white p-2 text-neutral-500 shadow-sm transition-colors hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-600 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
            aria-label="Ver tabla de datos"
            (click)="openTable()"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18" />
              <path d="M3 15h18" />
              <path d="M12 3v18" />
            </svg>
          </button>

          <!-- Actions -->
          <app-dropdown>
            <button
              trigger
              class="rounded-lg border border-neutral-200 bg-white p-2 text-neutral-500 shadow-sm transition-colors hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-600 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
              aria-label="Acciones del indicador"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
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

          <!-- Reload -->
          <button
            class="rounded-lg border border-neutral-200 bg-white p-2 text-neutral-500 shadow-sm transition-colors hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-600 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
            aria-label="Recargar datos del indicador"
            (click)="loadResultado()"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M8 16H3v5" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Result -->
      <div class="mt-4 flex items-end justify-between gap-x-3">
        @if (loading()) {
          <div class="h-9 w-full animate-pulse rounded bg-neutral-100 dark:bg-neutral-800"></div>
        } @else if (resultado(); as r) {
          <div class="min-w-0">
            <div
              class="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white"
            >
              {{ r.valor | number }}
            </div>
            <div class="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
              antes
              <span class="font-medium text-neutral-700 dark:text-neutral-200">
                {{ r.valor_antes | number }}
              </span>
              · después
              <span class="font-medium text-neutral-700 dark:text-neutral-200">
                {{ r.valor_despues | number }}
              </span>
            </div>
          </div>
        }
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

  protected selectedPeriod = signal<Periodo | undefined>(undefined);
  protected resultado = signal<ResultadoIndicador | undefined>(undefined);
  protected loading = signal(false);

  ngOnInit(): void {
    this.selectedPeriod.set(this.indicador().periodo);
    this.loadResultado();
  }

  protected selectedPeriodLabel(): string {
    const period = this.selectedPeriod();
    if (!period || !period.fechaInicial || period.nivel === 'full') {
      return 'Todo';
    }
    return period.fechaInicial + ' — ' + period.fechaFinal;
  }

  protected loadResultado(): void {
    const period = this.selectedPeriod();
    if (!period) { return; }
    this.loading.set(true);
    this.indicadoresService
      .getResultadoIndicador(this.indicador().id, period)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resultado) => {
          this.resultado.set(resultado);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  protected applyPeriod(period: Periodo): void {
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
    const template = this.templateService.getTemplate(accion.plantilla, null!);
    const pedidoVenta = new PedidoVentaDTO();
    pedidoVenta.plantilla = accion.plantilla;
    pedidoVenta.server = template?.server ?? '';
    this.utilsService.modalWithParams(pedidoVenta, true);
  }

  protected onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/icons/icon-192x192.png';
  }
}