import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RendimientoPersonal } from './indicators.types';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'performance-card',
  templateUrl: './performance-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [DecimalPipe],
})
export class PerformanceCardComponent {
  readonly item = input.required<RendimientoPersonal>();
}
