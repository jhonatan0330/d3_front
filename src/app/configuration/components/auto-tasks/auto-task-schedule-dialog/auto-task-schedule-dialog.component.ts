import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ProcesoTransicionAutomaticaDTO } from 'app/document/document.types';
import { AutoTaskService } from 'app/configuration/configuracion.api';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';

interface ScheduleDialogData {
    task: ProcesoTransicionAutomaticaDTO;
}

@Component({
    selector: 'app-auto-task-schedule-dialog',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatIconModule],
    templateUrl: './auto-task-schedule-dialog.component.html',
    styleUrl: './auto-task-schedule-dialog.component.scss'
})
export class AutoTaskScheduleDialogComponent implements OnInit {
    private service = inject(AutoTaskService);
    public dialogRef = inject<MatDialogRef<AutoTaskScheduleDialogComponent>>(MatDialogRef);
    public data = inject<ScheduleDialogData>(MAT_DIALOG_DATA);
    private notificationCenter = inject(NotificationCenterService);
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

    ngOnInit(): void {}

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
                this.notificationCenter.fire('Programado', 'Tarea programada correctamente', 'success');
                this.dialogRef.close(true);
            },
            error: () => {
                this.cargando = false;
                this.notificationCenter.fire('Error', 'No se pudo programar la tarea', 'error');
            }
        });
    }
}
