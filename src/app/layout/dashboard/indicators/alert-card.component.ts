import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AlertaStock } from './indicators.types';

@Component({
  selector: 'alert-card',
  templateUrl: './alert-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class AlertCardComponent {
  readonly alerta = input.required<AlertaStock>();
}
