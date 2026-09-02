import {
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { DropdownComponent } from 'app/shared/components/dropdown/dropdown.component';
import { Periodo } from 'app/layout/dashboard/indicadores.service';

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
  template: `
    <app-dropdown #dd="appDropdown">
      <button
        trigger
        class="flex items-center gap-x-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-600 shadow-sm transition-colors hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-700 dark:hover:text-neutral-100"
        aria-label="Filtrar por periodo"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-3.5 w-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4" />
          <path d="M8 2v4" />
          <path d="M3 10h18" />
        </svg>
        <span>{{ periodLabel() }}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-3 w-3"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      @switch (step()) {
        @case ('nivel') {
          <div class="py-1">
            <div class="px-4 py-1.5 text-xs font-semibold uppercase text-neutral-400">
              Nivel
            </div>
            @for (level of LEVELS; track level) {
              <button
                class="flex w-full items-center justify-between gap-4 px-4 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-700"
                (click)="onLevel($event, level, dd)"
              >
                <span>{{ levelLabel(level) }}</span>
                @if (period()?.nivel === level) {
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                }
              </button>
            }
          </div>
        }

        @case ('year') {
          <div class="py-1">
            <button
              class="w-full px-4 py-2 text-left text-xs font-medium text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-700"
              (click)="onBack($event)"
            >
              ← {{ backLabel() }}
            </button>
            <div class="max-h-56 overflow-y-auto">
              @for (year of yearOptions(); track year) {
                <button
                  class="w-full px-4 py-2 text-left text-sm text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-700"
                  (click)="onPickYear($event, year, dd)"
                >
                  {{ year }}
                </button>
              }
            </div>
          </div>
        }

        @case ('month') {
          <div class="py-1">
            <button
              class="w-full px-4 py-2 text-left text-xs font-medium text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-700"
              (click)="onBack($event)"
            >
              ← {{ backLabel() }}
            </button>
            <div class="max-h-56 overflow-y-auto">
              @for (month of MONTHS; track month) {
                <button
                  class="w-full px-4 py-2 text-left text-sm text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-700"
                  (click)="onPickMonth($event, month, dd)"
                >
                  {{ month }} {{ selectedYear() }}
                </button>
              }
            </div>
          </div>
        }

        @case ('day') {
          <div class="py-1">
            <button
              class="w-full px-4 py-2 text-left text-xs font-medium text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-700"
              (click)="onBack($event)"
            >
              ← {{ backLabel() }}
            </button>
            <div class="p-3">
              <!-- Calendar header -->
              <div class="mb-2 flex items-center justify-between">
                <button
                  class="rounded p-1 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-700"
                  aria-label="Mes anterior"
                  (click)="prevMonth($event)"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>
                <div class="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                  {{ calendarMonthLabel() }}
                </div>
                <button
                  class="rounded p-1 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-700"
                  aria-label="Mes siguiente"
                  (click)="nextMonth($event)"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>
              </div>

              <!-- Weekday header -->
              <div class="mb-1 grid grid-cols-7 gap-1 text-center text-xs text-neutral-400">
                @for (dow of WEEKDAYS; track dow) {
                  <span>{{ dow }}</span>
                }
              </div>

              <!-- Days -->
              <div class="grid grid-cols-7 gap-1 text-center">
                @for (day of calendarDays(); track $index) {
                  @if (day === 0) {
                    <span></span>
                  } @else {
                    <button
                      class="rounded-md py-1 text-sm text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-700"
                      (click)="onPickDay($event, day, dd)"
                    >
                      {{ day }}
                    </button>
                  }
                }
              </div>
            </div>
          </div>
        }
      }
    </app-dropdown>
  `,
})
export class PeriodFilterComponent {
  readonly period = input<Periodo>();
  readonly periodChange = output<Periodo>();

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

  protected periodLabel = computed(() => {
    const period = this.period();
    if (!period) { return 'Periodo'; }
    if (!period.fechaInicial || period.nivel === 'full') { return 'Todo'; }
    const [year, month, day] = period.fechaInicial.split('-').map(Number);
    if (period.nivel === 'año') { return `${year}`; }
    if (period.nivel === 'mes') {
      return `${MONTHS[(month ?? 1) - 1]} ${year}`;
    }
    return `${String(day ?? 1).padStart(2, '0')} ${MONTHS[(month ?? 1) - 1].slice(0, 3)} ${year}`;
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
    const period: Periodo = {
      id: base?.id ?? 0,
      nivel: this.level(),
      fechaInicial,
      fechaFinal,
    };
    this.periodChange.emit(period);
  }
}