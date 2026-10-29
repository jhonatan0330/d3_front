import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CanalAtencion } from './indicators.types';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'channel-card',
  templateUrl: './channel-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [DecimalPipe],
})
export class ChannelCardComponent {
  readonly canal = input.required<CanalAtencion>();
}
