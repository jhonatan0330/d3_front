import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Indicador, IndicadoresService } from 'app/dashboard/indicadores.service';
import { IndicatorCardComponent } from './indicator-card.component';

@Component({
  selector: 'indicators-cards',
  imports: [IndicatorCardComponent],
  template: `
    <div class="flex flex-col gap-4 p-6 sm:gap-6 lg:p-10">
      <div
        class="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3"
      >
        @for (indicador of indicadores(); track indicador.id) {
          <indicator-card [indicador]="indicador" />
        } @empty {
          <div
            class="col-span-full rounded-2xl border border-neutral-100 bg-white p-10 text-center text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-500"
          >
            No hay indicadores disponibles
          </div>
        }
      </div>
    </div>
  `,
})
export class IndicatorsCardsComponent {
  private destroyRef = inject(DestroyRef);
  private indicadoresService = inject(IndicadoresService);

  protected indicadores = signal<Indicador[]>([]);

  constructor() {
    this.indicadoresService
      .getIndicadores()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((indicadores) => this.indicadores.set(indicadores));
  }
}