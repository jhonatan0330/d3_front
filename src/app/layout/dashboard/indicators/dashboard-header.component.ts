import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';

export type DashboardRange = 'hoy' | 'ayer' | 'semana' | 'mes';

@Component({
  selector: 'dashboard-header',
  templateUrl: './dashboard-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class DashboardHeaderComponent {
  readonly rangeChange = output<DashboardRange>();

  readonly range = signal<DashboardRange>('hoy');

  readonly ranges: DashboardRange[] = ['hoy', 'ayer', 'semana', 'mes'];

  readonly rangeLabels: Record<DashboardRange, string> = {
    hoy: 'Hoy',
    ayer: 'Ayer',
    semana: 'Esta Semana',
    mes: 'Este Mes',
  };

  selectRange(r: DashboardRange): void {
    this.range.set(r);
    this.rangeChange.emit(r);
  }
}
