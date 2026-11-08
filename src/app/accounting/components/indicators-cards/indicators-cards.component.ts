import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { Indicador, IndicadorDTO } from 'app/accounting/domain/IndicadorDTO';
import { IndicadoresService } from 'app/accounting/business/indicadores.service';
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
        map((indicadores: IndicadorDTO[]) => indicadores.map((item) => this.indicadoresService.toIndicador(item)))
      )
      .subscribe((indicadores) => this.indicadores.set(indicadores));
  }
}
