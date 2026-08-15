import { DecimalPipe } from '@angular/common';
import {
  Component,
  computed,
  inject,
  output,
  signal,
  Signal,
} from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexGrid,
  ApexLegend,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexStates,
  ApexStroke,
  ApexTheme,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  ChartComponent,
} from 'ng-apexcharts';
import { ProjectDashboardService } from '../project.service';
import { DropdownComponent } from 'app/shared/components/dropdown/dropdown.component';
import { DropdownItemComponent } from 'app/shared/components/dropdown/dropdown-item.component';
import { DashboardIndicatorsCardComponent } from './card.component';
import { DashboardIndicatorsActionsComponent } from './actions.component';
import { DATE_RANGES, DateRange } from './date-ranges';

@Component({
  selector: 'dashboard-indicators',
  imports: [
    ChartComponent,
    DecimalPipe,
    DropdownComponent,
    DropdownItemComponent,
    DashboardIndicatorsCardComponent,
    DashboardIndicatorsActionsComponent,
  ],
  template: `
    <div class="flex flex-col gap-4 p-6 sm:gap-6 lg:p-10">
      <!-- Sparklines: Summary Metrics -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
        @for (item of data.summary; track item.title) {
          <div
            class="group flex flex-col rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-none dark:hover:border-neutral-700"
          >
            <div class="flex items-center justify-between gap-x-2">
              <div class="flex items-center gap-2.5">
                <span
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-neutral-500 [&>svg]:h-5 [&>svg]:w-5"
                >
                  @switch (item.icon) {
                    @case ('list-todo') {
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path d="M8 6h13" />
                        <path d="M8 12h13" />
                        <path d="M8 18h13" />
                        <path d="M3 6h.01" />
                        <path d="M3 12h.01" />
                        <path d="M3 18h.01" />
                      </svg>
                    }
                    @case ('clock-alert') {
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    }
                    @case ('bug') {
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path d="m8 2 1.88 1.88" />
                        <path d="M14.12 3.88 16 2" />
                        <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
                        <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" />
                        <path d="M12 20v-9" />
                        <path d="M6.53 9C4.6 8.8 3 7.1 3 5" />
                        <path d="M6 13H2" />
                        <path d="M3 21c0-2.1 1.7-3.9 3.8-4" />
                        <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" />
                        <path d="M22 13h-4" />
                        <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" />
                      </svg>
                    }
                    @case ('git-branch-plus') {
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path d="M6 3v12" />
                        <path d="M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
                        <path d="M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
                        <path d="M15 6a9 9 0 0 0-9 9" />
                        <path d="M18 15v6" />
                        <path d="M21 18h-6" />
                      </svg>
                    }
                  }
                </span>
                <div>
                  <div class="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                    {{ item.title }}
                  </div>
                  <div class="mt-0.5 flex items-center gap-x-1 text-xs">
                    <span
                      class="inline-flex items-center gap-0.5 font-semibold"
                      [class.text-green-600]="item.change.up"
                      [class.text-red-600]="!item.change.up"
                    >
                      @if (item.change.up) {
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-3 w-3"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <path d="M5 12l7-7 7 7" />
                          <path d="M12 19V5" />
                        </svg>
                      } @else {
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-3 w-3"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <path d="M12 5v14" />
                          <path d="M19 12l-7 7-7-7" />
                        </svg>
                      }
                      {{ item.change.value > 0 ? '+' : '' }}{{ item.change.value }}
                    </span>
                    <span class="text-neutral-400 dark:text-neutral-500">
                      vs prev. period
                    </span>
                  </div>
                </div>
              </div>

              <app-dropdown>
                <button
                  dropdown-trigger
                  class="rounded-lg border border-neutral-200 bg-white p-1.5 text-neutral-500 shadow-sm transition-colors hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-600 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
                  aria-label="Summary options"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <circle cx="12" cy="5" r="1" />
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="12" cy="19" r="1" />
                  </svg>
                </button>
                @for (range of dateRanges; track range) {
                  <app-dropdown-item (clicked)="summaryRange.set(range)">
                    <span class="flex w-full items-center justify-between gap-4">
                      <span>{{ range }}</span>
                      @if (summaryRange() === range) {
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
                    </span>
                  </app-dropdown-item>
                }
              </app-dropdown>
            </div>

            <div class="mt-4 flex items-end justify-between gap-x-3">
              <span
                class="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white"
              >
                {{ item.value | number }}
              </span>
              <apx-chart
                class="h-12 w-24"
                [chart]="sparklineCharts[item.title].chart"
                [colors]="sparklineCharts[item.title].colors"
                [series]="sparklineCharts[item.title].series"
                [stroke]="sparklineCharts[item.title].stroke"
                [tooltip]="sparklineCharts[item.title].tooltip()"
                [xaxis]="sparklineCharts[item.title].xaxis"
              ></apx-chart>
            </div>
          </div>
        }
      </div>

      <div class="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-2">
        <!-- Donut: Issues by Status -->
        <dashboard-indicators-card>
          <div class="flex items-center justify-between gap-x-2">
            <div class="flex items-center gap-x-2.5">
              <span
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                  <path d="M22 12A10 10 0 0 0 12 2v10z" />
                </svg>
              </span>
              <div>
                <div
                  class="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white"
                >
                  Issues by Status
                </div>
                <div class="text-xs text-neutral-500 dark:text-neutral-400">
                  {{ issuesRange() }} · {{ issuesTotal }} total
                </div>
              </div>
            </div>
            <dashboard-indicators-actions
              [rangeLabel]="issuesRange()"
              (rangeChange)="issuesRange.set($event)"
              (filter)="onFilter('issues')"
              (explore)="onExplore('issues')"
            ></dashboard-indicators-actions>
          </div>

          <apx-chart
            class="mt-4 h-64"
            [chart]="issuesDonutChart.chart"
            [labels]="issuesDonutChart.labels"
            [legend]="issuesDonutChart.legend"
            [plotOptions]="issuesDonutChart.plotOptions"
            [series]="issuesDonutChart.series"
            [states]="issuesDonutChart.states"
            [stroke]="issuesDonutChart.stroke"
            [tooltip]="issuesDonutChart.tooltip()"
          ></apx-chart>
        </dashboard-indicators-card>

        <!-- RadialBar: Budget Utilization -->
        <dashboard-indicators-card>
          <div class="flex items-center justify-between gap-x-2">
            <div class="flex items-center gap-x-2.5">
              <span
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="m12 14 4-4" />
                  <path d="M3.34 19a10 10 0 1 1 17.32 0" />
                </svg>
              </span>
              <div>
                <div
                  class="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white"
                >
                  Budget Utilization
                </div>
                <div class="text-xs text-neutral-500 dark:text-neutral-400">
                  {{ budgetRange() }} · spent by category
                </div>
              </div>
            </div>
            <dashboard-indicators-actions
              [rangeLabel]="budgetRange()"
              (rangeChange)="budgetRange.set($event)"
              (filter)="onFilter('budget')"
              (explore)="onExplore('budget')"
            ></dashboard-indicators-actions>
          </div>

          <apx-chart
            class="mt-4 h-64"
            [chart]="budgetRadialChart.chart"
            [labels]="budgetRadialChart.labels"
            [legend]="budgetRadialChart.legend"
            [plotOptions]="budgetRadialChart.plotOptions"
            [series]="budgetRadialChart.series"
            [states]="budgetRadialChart.states"
            [stroke]="budgetRadialChart.stroke"
            [tooltip]="budgetRadialChart.tooltip()"
          ></apx-chart>
        </dashboard-indicators-card>

        <!-- Area: Issues Trend -->
        <dashboard-indicators-card>
          <div class="flex items-center justify-between gap-x-2">
            <div class="flex items-center gap-x-2.5">
              <span
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M22 7l-8.5 8.5-5-5L2 17" />
                  <path d="M16 7h6v6" />
                </svg>
              </span>
              <div>
                <div
                  class="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white"
                >
                  Issues Trend
                </div>
                <div class="text-xs text-neutral-500 dark:text-neutral-400">
                  {{ trendRange() }} · new vs closed
                </div>
              </div>
            </div>
            <dashboard-indicators-actions
              [rangeLabel]="trendRange()"
              (rangeChange)="trendRange.set($event)"
              (filter)="onFilter('trend')"
              (explore)="onExplore('trend')"
            ></dashboard-indicators-actions>
          </div>

          <apx-chart
            class="mt-4 h-64"
            [chart]="issuesAreaChart.chart"
            [colors]="issuesAreaChart.colors"
            [dataLabels]="issuesAreaChart.dataLabels"
            [grid]="issuesAreaChart.grid"
            [labels]="issuesAreaChart.labels"
            [legend]="issuesAreaChart.legend"
            [series]="issuesAreaChart.series"
            [states]="issuesAreaChart.states"
            [stroke]="issuesAreaChart.stroke"
            [tooltip]="issuesAreaChart.tooltip()"
            [xaxis]="issuesAreaChart.xaxis"
            [yaxis]="issuesAreaChart.yaxis"
          ></apx-chart>
        </dashboard-indicators-card>

        <!-- Bar: Budget Distribution -->
        <dashboard-indicators-card>
          <div class="flex items-center justify-between gap-x-2">
            <div class="flex items-center gap-x-2.5">
              <span
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M3 3v18h18" />
                  <path d="M18 17V9" />
                  <path d="M13 17V5" />
                  <path d="M8 17v-3" />
                </svg>
              </span>
              <div>
                <div
                  class="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white"
                >
                  Budget Distribution
                </div>
                <div class="text-xs text-neutral-500 dark:text-neutral-400">
                  {{ distributionRange() }} · allocated per category
                </div>
              </div>
            </div>
            <dashboard-indicators-actions
              [rangeLabel]="distributionRange()"
              (rangeChange)="distributionRange.set($event)"
              (filter)="onFilter('distribution')"
              (explore)="onExplore('distribution')"
            ></dashboard-indicators-actions>
          </div>

          <apx-chart
            class="mt-4 h-64"
            [chart]="budgetBarChart.chart"
            [colors]="budgetBarChart.colors"
            [dataLabels]="budgetBarChart.dataLabels"
            [grid]="budgetBarChart.grid"
            [labels]="budgetBarChart.labels"
            [legend]="budgetBarChart.legend"
            [plotOptions]="budgetBarChart.plotOptions"
            [series]="budgetBarChart.series"
            [states]="budgetBarChart.states"
            [stroke]="budgetBarChart.stroke"
            [tooltip]="budgetBarChart.tooltip()"
            [xaxis]="budgetBarChart.xaxis"
            [yaxis]="budgetBarChart.yaxis"
          ></apx-chart>
        </dashboard-indicators-card>
      </div>
    </div>
  `,
})
export default class DashboardIndicators {
  private projectDashboardService = inject(ProjectDashboardService);
  protected data = this.projectDashboardService.data;

  protected dateRanges = DATE_RANGES;
  protected summaryRange = signal<DateRange>('Last 7 days');
  protected issuesRange = signal<DateRange>('Last 7 days');
  protected budgetRange = signal<DateRange>('Last 30 days');
  protected trendRange = signal<DateRange>('Last 7 days');
  protected distributionRange = signal<DateRange>('Last quarter');

  protected issuesTotal = this.data.issues.overview.reduce(
    (sum, item) => sum + item.value,
    0,
  );

  readonly explore = output<string>();
  readonly filter = output<string>();

  protected sparklineCharts: Record<string, {
    chart: ApexChart;
    colors: string[];
    series: ApexAxisChartSeries;
    stroke: ApexStroke;
    tooltip: Signal<ApexTooltip>;
    xaxis: ApexXAxis;
  }> = {};

  constructor() {
    this.data.summary.forEach((item) => {
      const isPositive = item.change.up;
      this.sparklineCharts[item.title] = {
        chart: {
          animations: { enabled: false },
          background: 'transparent',
          height: 48,
          width: 96,
          type: 'line',
          sparkline: { enabled: true },
          toolbar: { show: false },
          zoom: { enabled: false },
        },
        colors: [isPositive ? '#16a34a' : '#dc2626'],
        series: [{
          name: item.title,
          data: this.generateSparklineData(item.value, isPositive),
        }],
        stroke: { curve: 'smooth', width: 2 },
        tooltip: computed(() => ({
          y: { formatter: (val: number) => `${val}` },
        })),
        xaxis: { labels: { show: false }, axisBorder: { show: false } },
      };
    });
  }

  protected issuesDonutChart: {
    chart: ApexChart;
    labels: string[];
    legend: ApexLegend;
    plotOptions: ApexPlotOptions;
    series: ApexNonAxisChartSeries;
    states: ApexStates;
    stroke: ApexStroke;
    tooltip: Signal<ApexTooltip>;
  } = {
    chart: {
      animations: { enabled: false },
      background: 'transparent',
      fontFamily: 'inherit',
      foreColor: 'inherit',
      height: '100%',
      type: 'donut',
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    labels: this.data.issues.overview.map((i) => i.label),
    legend: { position: 'bottom', fontSize: '12px', markers: { size: 8 } },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              formatter: () => `${this.issuesTotal}`,
            },
          },
        },
      },
    },
    series: this.data.issues.overview.map((i) => i.value),
    states: {
      hover: { filter: { type: 'darken' } },
      active: { filter: { type: 'none' } },
    },
    stroke: { width: 2, colors: ['white'] },
    tooltip: computed(() => ({
      y: { formatter: (val: number) => `${val} issues` },
    })),
  };

  protected budgetRadialChart: {
    chart: ApexChart;
    labels: string[];
    legend: ApexLegend;
    plotOptions: ApexPlotOptions;
    series: ApexNonAxisChartSeries;
    states: ApexStates;
    stroke: ApexStroke;
    tooltip: Signal<ApexTooltip>;
  } = {
    chart: {
      animations: { enabled: false },
      background: 'transparent',
      fontFamily: 'inherit',
      foreColor: 'inherit',
      height: '100%',
      type: 'radialBar',
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    labels: this.data.budget.map((b) => b.type),
    legend: { position: 'bottom', fontSize: '12px', markers: { size: 8 } },
    plotOptions: {
      radialBar: {
        hollow: { size: '35%' },
        dataLabels: {
          name: { show: true, fontSize: '12px' },
          value: {
            show: true,
            fontSize: '16px',
            fontWeight: 600,
            formatter: (val) => `${Number(val).toFixed(1)}%`,
          },
        },
      },
    },
    series: this.data.budget.map((b) => b.expensesPercentage),
    states: {
      hover: { filter: { type: 'darken' } },
      active: { filter: { type: 'none' } },
    },
    stroke: { width: 2 },
    tooltip: computed(() => ({
      y: { formatter: (val) => `${Number(val).toFixed(1)}% spent` },
    })),
  };

  protected issuesAreaChart: {
    chart: ApexChart;
    colors: string[];
    dataLabels: ApexDataLabels;
    grid: ApexGrid;
    labels: string[];
    legend: ApexLegend;
    series: ApexAxisChartSeries;
    states: ApexStates;
    stroke: ApexStroke;
    tooltip: Signal<ApexTooltip>;
    xaxis: ApexXAxis;
    yaxis: ApexYAxis;
  } = {
    chart: {
      animations: { enabled: false },
      fontFamily: 'inherit',
      foreColor: 'inherit',
      height: '100%',
      type: 'area',
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors: ['#6366f1', '#10b981'],
    dataLabels: { enabled: false },
    grid: {
      borderColor: 'light-dark(var(--color-neutral-200), var(--color-neutral-800))',
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
    },
    labels: this.data.issues.chart.labels,
    legend: { position: 'top', fontSize: '12px', markers: { size: 8 } },
    series: this.data.issues.chart.series.map((s) => ({
      ...s,
      type: 'area' as const,
    })),
    states: {
      hover: { filter: { type: 'none' } },
      active: { filter: { type: 'none' } },
    },
    stroke: { curve: 'smooth', width: 2 },
    tooltip: computed(() => ({ theme: 'light' })),
    xaxis: {
      axisBorder: { color: 'light-dark(var(--color-neutral-200), var(--color-neutral-800))' },
      axisTicks: { color: 'light-dark(var(--color-neutral-200), var(--color-neutral-800))' },
      labels: { style: { colors: 'var(--color-neutral-500)' } },
    },
    yaxis: {
      labels: { style: { colors: 'var(--color-neutral-500)' } },
    },
  };

  protected budgetBarChart: {
    chart: ApexChart;
    colors: string[];
    dataLabels: ApexDataLabels;
    grid: ApexGrid;
    labels: string[];
    legend: ApexLegend;
    plotOptions: ApexPlotOptions;
    series: ApexAxisChartSeries;
    states: ApexStates;
    stroke: ApexStroke;
    tooltip: Signal<ApexTooltip>;
    xaxis: ApexXAxis;
    yaxis: ApexYAxis;
  } = {
    chart: {
      animations: { enabled: false },
      fontFamily: 'inherit',
      foreColor: 'inherit',
      height: '100%',
      type: 'bar',
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors: ['#f59e0b'],
    dataLabels: { enabled: false },
    grid: {
      borderColor: 'light-dark(var(--color-neutral-200), var(--color-neutral-800))',
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
    },
    labels: this.data.budgetDistribution.categories,
    legend: { show: false },
    plotOptions: {
      bar: {
        columnWidth: '55%',
        borderRadius: 6,
        distributed: true,
      },
    },
    series: this.data.budgetDistribution.series,
    states: {
      hover: { filter: { type: 'none' } },
      active: { filter: { type: 'none' } },
    },
    stroke: { show: false },
    tooltip: computed(() => ({
      y: { formatter: (val: number) => `$${val}k` },
    })),
    xaxis: {
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: 'var(--color-neutral-500)' } },
    },
    yaxis: {
      labels: {
        style: { colors: 'var(--color-neutral-500)' },
        formatter: (val: number) => `$${val}k`,
      },
    },
  };

  onExplore(key: string): void {
    this.explore.emit(key);
  }

  onFilter(key: string): void {
    this.filter.emit(key);
  }

  private generateSparklineData(baseValue: number, isPositive: boolean): number[] {
    const data: number[] = [];
    let value = baseValue - (isPositive ? 5 : -5);
    for (let i = 0; i < 7; i++) {
      value += (Math.random() - 0.3) * 4;
      data.push(Math.max(0, Math.round(value)));
    }
    return data;
  }
}