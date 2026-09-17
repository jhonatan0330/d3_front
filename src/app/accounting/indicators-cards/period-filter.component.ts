import {
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { DropdownComponent } from 'app/shared/components/dropdown/dropdown/dropdown.component';
import { PeriodoDTO } from 'app/accounting/accounting.types';

type Nivel = 'full' | 'año' | 'mes' | 'dia';
type Step = 'nivel' | 'year' | 'month' | 'day';

const MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const LEVELS: Nivel[] = ['full', 'año', 'mes', 'dia'];

@Component({
  selector: 'period-filter',
  imports: [DropdownComponent],
  templateUrl: './period-filter.component.html',
})
export class PeriodFilterComponent {
  readonly period = input<PeriodoDTO>();
  readonly periodChange = output<PeriodoDTO>();

  protected LEVELS = LEVELS;
  protected MONTHS = MONTHS;
  protected WEEKDAYS = WEEKDAYS;

  protected step = signal<Step>('nivel');
  private level = signal<Nivel>('full');
  protected selectedYear = signal(new Date().getFullYear());
  private selectedMonth = signal(new Date().getMonth());

  private baseYear = computed(() => {
    const fecha = this.period()?.fechaInicial;
    const year = fecha ? Number(fecha.slice(0, 4)) : NaN;
    return Number.isFinite(year) ? year : new Date().getFullYear();
  });

  private baseMonth = computed(() => {
    const fecha = this.period()?.fechaInicial;
    const month = fecha ? Number(fecha.slice(5, 7)) : NaN;
    return Number.isFinite(month) ? month : new Date().getMonth() + 1;
  });

  protected yearOptions = computed<string[]>(() => {
    const currentYear = new Date().getFullYear();
    const years: string[] = [];
    for (let y = currentYear; y >= currentYear - 10; y--) {
      years.push(`${y}`);
    }
    return years;
  });

  protected calendarMonthLabel = computed(() => {
    return `${MONTHS[this.selectedMonth()]} ${this.selectedYear()}`;
  });

  protected calendarDays = computed<number[]>(() => {
    const year = this.selectedYear();
    const month = this.selectedMonth();
    const offset = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: number[] = [];
    for (let i = 0; i < offset; i++) {
      days.push(0);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(d);
    }
    return days;
  });

  protected backLabel = computed(() => {
    switch (this.step()) {
      case 'year': return 'Niveles';
      case 'month': return 'Años';
      case 'day': return 'Meses';
      default: return '';
    }
  });

  protected levelLabel(level: Nivel): string {
    switch (level) {
      case 'full': return 'Todo';
      case 'año': return 'Año';
      case 'mes': return 'Mes';
      case 'dia': return 'Día';
    }
  }

  protected onLevel(event: Event, level: Nivel, dd: DropdownComponent): void {
    event.stopPropagation();
    if (level === 'full') {
      this.step.set('nivel');
      this.level.set('full');
      this.emitPeriod('', '');
      dd.close();
      return;
    }
    this.level.set(level);
    this.selectedYear.set(this.baseYear());
    this.selectedMonth.set(this.baseMonth() - 1);
    this.step.set('year');
  }

  protected onBack(event: Event): void {
    event.stopPropagation();
    switch (this.step()) {
      case 'year': this.step.set('nivel'); break;
      case 'month': this.step.set('year'); break;
      case 'day': this.step.set('month'); break;
      default: this.step.set('nivel');
    }
  }

  protected onPickYear(event: Event, year: string, dd: DropdownComponent): void {
    event.stopPropagation();
    this.selectedYear.set(Number(year));
    if (this.level() === 'año') {
      this.step.set('nivel');
      this.emitPeriod(`${year}-01-01`, `${year}-12-31`);
      dd.close();
      return;
    }
    this.step.set('month');
  }

  protected onPickMonth(event: Event, month: string, dd: DropdownComponent): void {
    event.stopPropagation();
    this.selectedMonth.set(MONTHS.indexOf(month));
    const year = this.selectedYear();
    if (this.level() === 'mes') {
      this.step.set('nivel');
      const monthIndex = MONTHS.indexOf(month) + 1;
      const lastDay = new Date(year, monthIndex, 0).getDate();
      this.emitPeriod(
        `${year}-${String(monthIndex).padStart(2, '0')}-01`,
        `${year}-${String(monthIndex).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
      );
      dd.close();
      return;
    }
    this.step.set('day');
  }

  protected onPickDay(event: Event, day: number, dd: DropdownComponent): void {
    event.stopPropagation();
    const year = this.selectedYear();
    const month = this.selectedMonth() + 1;
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    this.step.set('nivel');
    this.emitPeriod(date, date);
    dd.close();
  }

  protected prevMonth(event: Event): void {
    event.stopPropagation();
    if (this.selectedMonth() === 0) {
      this.selectedMonth.set(11);
      this.selectedYear.update((year) => year - 1);
    } else {
      this.selectedMonth.update((month) => month - 1);
    }
  }

  protected nextMonth(event: Event): void {
    event.stopPropagation();
    if (this.selectedMonth() === 11) {
      this.selectedMonth.set(0);
      this.selectedYear.update((year) => year + 1);
    } else {
      this.selectedMonth.update((month) => month + 1);
    }
  }

  private emitPeriod(fechaInicial: string, fechaFinal: string): void {
    const base = this.period();
    const period: PeriodoDTO = {
      id: base?.id ?? 0,
      nivel: this.level(),
      fechaInicial,
      fechaFinal,
    };
    this.periodChange.emit(period);
  }
}
