import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ProcesoTransicionAutomaticaDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { AutoTaskService } from './auto-task.service';
import Swal from 'sweetalert2';

interface ScheduleDialogData {
    task: ProcesoTransicionAutomaticaDTO;
}

@Component({
    selector: 'app-auto-task-schedule-dialog',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatRadioModule, MatDatepickerModule, MatNativeDateModule],
    template: `
    <div class="max-w-md w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 space-y-4">
      <h2 class="text-xl font-bold border-b border-gray-200 dark:border-gray-700 pb-2">
        <mat-icon class="text-blue-500 mr-2">schedule</mat-icon>
        Programar Tarea: {{ data.task.nombre }}
      </h2>

      <form #form="ngForm" (ngSubmit)="onSchedule()">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold mb-2">Tipo de Programación</label>
            <div class="space-y-2">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" [(ngModel)]="scheduleType" name="scheduleType" value="cron" class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                <span>Expresión Cron</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" [(ngModel)]="scheduleType" name="scheduleType" value="once" class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                <span>Fecha Única</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" [(ngModel)]="scheduleType" name="scheduleType" value="recurring" class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                <span>Recurrente (diario/semanal/mensual)</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" [(ngModel)]="scheduleType" name="scheduleType" value="clear" class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                <span class="text-red-600">Quitar Programación</span>
              </label>
            </div>
          </div>

          @if (scheduleType === 'cron') {
            <div>
              <label class="block text-sm font-semibold mb-1">Expresión Cron *</label>
              <input type="text" [(ngModel)]="cronExpression" name="cronExpression" required class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm" placeholder="0 0 * * * (diario medianoche)" />
              <div class="mt-2 space-y-1 text-xs text-gray-500 dark:text-gray-400 font-mono">
                <div>┌───────────── minuto (0 - 59)</div>
                <div>│ ┌───────────── hora (0 - 23)</div>
                <div>│ │ ┌───────────── día del mes (1 - 31)</div>
                <div>│ │ │ ┌───────────── mes (1 - 12)</div>
                <div>│ │ │ │ ┌───────────── día de la semana (0 - 7) (dom=0 o 7)</div>
                <div>│ │ │ │ │</div>
                <div>* * * * *</div>
              </div>
              <div class="mt-2 flex flex-wrap gap-2">
                <button type="button" class="btn-sm btn-flat-secondary" (click)="setCron('0 0 * * *')">Diario 00:00</button>
                <button type="button" class="btn-sm btn-flat-secondary" (click)="setCron('0 12 * * *')">Diario 12:00</button>
                <button type="button" class="btn-sm btn-flat-secondary" (click)="setCron('0 0 * * 1')">Lunes 00:00</button>
                <button type="button" class="btn-sm btn-flat-secondary" (click)="setCron('0 0 1 * *')">1ro del mes</button>
              </div>
            </div>
          }

          @if (scheduleType === 'once') {
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Fecha</mat-label>
                <input matInput [matDatepicker]="dpDate" [(ngModel)]="onceDate" name="onceDate" required />
                <mat-datepicker-toggle matIconSuffix [for]="dpDate"></mat-datepicker-toggle>
                <mat-datepicker #dpDate></mat-datepicker>
              </mat-form-field>
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Hora</mat-label>
                <input matInput type="time" [(ngModel)]="onceTime" name="onceTime" required />
              </mat-form-field>
            </div>
          }

          @if (scheduleType === 'recurring') {
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-semibold mb-1">Frecuencia</label>
                <mat-form-field appearance="outline" class="w-full">
                  <mat-select [(ngModel)]="recurringFreq" name="recurringFreq" required>
                    <mat-option value="daily">Diario</mat-option>
                    <mat-option value="weekly">Semanal</mat-option>
                    <mat-option value="monthly">Mensual</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
              <div>
                <label class="block text-sm font-semibold mb-1">Hora</label>
                <input type="time" [(ngModel)]="recurringTime" name="recurringTime" required class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              @if (recurringFreq === 'weekly') {
                <div>
                  <label class="block text-sm font-semibold mb-1">Días de la semana</label>
                  <div class="flex flex-wrap gap-2">
                    @for (day of weekDays; track day.value) {
                      <label class="flex items-center gap-1 cursor-pointer px-2 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                        <input type="checkbox" [(ngModel)]="day.selected" [name]="'weekday_' + day.value" class="w-4 h-4 text-blue-600 border-gray-300 rounded" />
                        <span class="text-sm">{{ day.label }}</span>
                      </label>
                    }
                  </div>
                </div>
              }
              @if (recurringFreq === 'monthly') {
                <div>
                  <label class="block text-sm font-semibold mb-1">Día del mes (1-31)</label>
                  <input type="number" min="1" max="31" [(ngModel)]="monthlyDay" name="monthlyDay" required class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              }
              <div>
                <label class="block text-sm font-semibold mb-1">Fecha Inicio</label>
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Desde</mat-label>
                  <input matInput [matDatepicker]="dpStart" [(ngModel)]="recurringStart" name="recurringStart" />
                  <mat-datepicker-toggle matIconSuffix [for]="dpStart"></mat-datepicker-toggle>
                  <mat-datepicker #dpStart></mat-datepicker>
                </mat-form-field>
              </div>
            </div>
          }
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button type="button" class="btn-flat" (click)="dialogRef.close()">Cancelar</button>
          <button type="submit" class="btn-flat-primary" [disabled]="cargando || (scheduleType !== 'clear' && !form.valid)">
            {{ cargando ? 'Programando...' : 'Programar' }}
          </button>
        </div>
      </form>
    </div>
  `,
    styles: [`
    .btn-flat { padding: 0.5rem 1.5rem; border-radius: 4px; font-weight: 500; border: 1px solid #e0e0e0; background: white; color: #333; }
    .btn-flat:hover { background: #f5f5f5; }
    .btn-flat-primary { padding: 0.5rem 1.5rem; border-radius: 4px; font-weight: 500; background: #3f51b5; color: white; border: none; }
    .btn-flat-primary:hover:not(:disabled) { background: #303f9f; }
    .btn-flat-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-flat-secondary { padding: 0.25rem 0.75rem; border-radius: 4px; font-weight: 500; font-size: 0.75rem; border: 1px solid #e0e0e0; background: white; color: #333; }
    .btn-flat-secondary:hover { background: #f5f5f5; }
    .btn-sm { font-size: 0.75rem; padding: 0.25rem 0.5rem; }
  `]
})
export class AutoTaskScheduleDialogComponent implements OnInit {
    private service = inject(AutoTaskService);
    public dialogRef = inject<MatDialogRef<AutoTaskScheduleDialogComponent>>(MatDialogRef);
    public data = inject<ScheduleDialogData>(MAT_DIALOG_DATA);

    scheduleType = 'cron';
    cronExpression = '';
    onceDate: Date | null = null;
    onceTime = '';
    recurringFreq = 'daily';
    recurringTime = '00:00';
    recurringStart: Date | null = null;
    monthlyDay = 1;
    weekDays = [
        { value: 0, label: 'Dom', selected: false },
        { value: 1, label: 'Lun', selected: false },
        { value: 2, label: 'Mar', selected: false },
        { value: 3, label: 'Mié', selected: false },
        { value: 4, label: 'Jue', selected: false },
        { value: 5, label: 'Vie', selected: false },
        { value: 6, label: 'Sáb', selected: false }
    ];
    cargando = false;

    ngOnInit(): void {
        if (this.data.task.programa) {
            this.cronExpression = this.data.task.programa;
            this.scheduleType = 'cron';
        }
    }

    setCron(cron: string): void {
        this.cronExpression = cron;
    }

    buildCronExpression(): string {
        switch (this.scheduleType) {
            case 'cron':
                return this.cronExpression;
            case 'once':
                if (!this.onceDate || !this.onceTime) return '';
                const date = new Date(this.onceDate);
                const [hours, minutes] = this.onceTime.split(':').map(Number);
                date.setHours(hours, minutes, 0, 0);
                return `${minutes} ${hours} ${date.getDate()} ${date.getMonth() + 1} *`;
            case 'recurring':
                const [rHours, rMinutes] = this.recurringTime.split(':').map(Number);
                switch (this.recurringFreq) {
                    case 'daily':
                        return `${rMinutes} ${rHours} * * *`;
                    case 'weekly':
                        const days = this.weekDays.filter(d => d.selected).map(d => d.value).join(',') || '*';
                        return `${rMinutes} ${rHours} * * ${days}`;
                    case 'monthly':
                        return `${rMinutes} ${rHours} ${this.monthlyDay} * *`;
                }
                return '';
            case 'clear':
                return '';
        }
        return '';
    }

    onSchedule(): void {
        this.cargando = true;
        const programacion = {
            tipo: this.scheduleType,
            cron: this.scheduleType === 'cron' ? this.cronExpression : this.buildCronExpression(),
            fecha: this.scheduleType === 'once' && this.onceDate && this.onceTime
                ? (() => { const d = new Date(this.onceDate!); const [h, m] = this.onceTime!.split(':').map(Number); d.setHours(h, m, 0, 0); return d; })()
                : undefined
        };

        this.service.scheduleAutoTask(this.data.task.llaveTabla, programacion).subscribe({
            next: () => {
                this.cargando = false;
                Swal.fire('Programado', 'Tarea programada correctamente', 'success');
                this.dialogRef.close(true);
            },
            error: () => {
                this.cargando = false;
                Swal.fire('Error', 'No se pudo programar la tarea', 'error');
            }
        });
    }
}