import { Component } from '@angular/core';

@Component({
  selector: 'dashboard-indicators-card',
  template: `
    <div
      class="flex flex-col rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-none dark:hover:border-neutral-700"
    >
      <ng-content></ng-content>
    </div>
  `,
})
export class DashboardIndicatorsCardComponent {}