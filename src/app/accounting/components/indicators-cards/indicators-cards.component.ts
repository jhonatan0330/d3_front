import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { IndicatorDTO } from 'app/accounting/domain/IndicatorDTO';
import { IndicadoresService } from 'app/accounting/business/indicadores.service';
import { IndicatorCardComponent } from 'app/accounting/components/indicator-card/indicator-card.component';

@Component({
  selector: 'indicators-cards',
  imports: [IndicatorCardComponent],
  templateUrl: './indicators-cards.component.html',
})
export class IndicatorsCardsComponent {
  private destroyRef = inject(DestroyRef);
  private indicadoresService = inject(IndicadoresService);

  protected indicadores = signal<IndicatorDTO[]>([]);

  constructor() {
    this.indicadoresService
      .getIndicadores()
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((indicadores) => this.indicadores.set(indicadores));
  }
}
