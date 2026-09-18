import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { Indicador, IndicadorDTO } from 'app/accounting/domain/accounting.types';
import { IndicadoresService } from 'app/accounting/indicators-cards/indicadores.service';
import { IndicatorCardComponent } from './indicator-card.component';

@Component({
  selector: 'indicators-cards',
  imports: [IndicatorCardComponent],
  templateUrl: './indicators-cards.component.html',
})
export class IndicatorsCardsComponent {
  private destroyRef = inject(DestroyRef);
  private indicadoresService = inject(IndicadoresService);

  protected indicadores = signal<Indicador[]>([]);

  constructor() {
    this.indicadoresService
      .getIndicadores()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map((indicadores: IndicadorDTO[]) => indicadores.map((i) => this.indicadoresService.toIndicador(i)))
      )
      .subscribe((indicadores) => this.indicadores.set(indicadores));
  }
}
