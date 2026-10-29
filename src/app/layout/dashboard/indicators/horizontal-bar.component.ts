import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ProductoRotacion } from './indicators.types';

@Component({
  selector: 'horizontal-bar',
  templateUrl: './horizontal-bar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class HorizontalBarComponent {
  readonly items = input.required<ProductoRotacion[]>();
}
