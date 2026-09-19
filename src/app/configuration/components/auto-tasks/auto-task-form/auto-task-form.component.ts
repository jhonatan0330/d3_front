import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ProcesoTransicionAutomaticaDTO } from 'app/document/document.types';
import { AutoTaskService } from 'app/configuration/configuracion.api';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';

@Component({
    selector: 'app-auto-task-form',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule],
    templateUrl: './auto-task-form.component.html',
})
export class AutoTaskFormComponent implements OnInit {
    public dialogRef = inject<MatDialogRef<AutoTaskFormComponent>>(MatDialogRef);
    public data = inject<ProcesoTransicionAutomaticaDTO | null>(MAT_DIALOG_DATA);
    private notificationCenter = inject(NotificationCenterService);
    private service = inject(AutoTaskService);

    task: ProcesoTransicionAutomaticaDTO = new ProcesoTransicionAutomaticaDTO();
    cargando = false;

    ngOnInit(): void {
        if (this.data) {
            this.task = { ...this.data };
        } else {
            this.task = new ProcesoTransicionAutomaticaDTO();
            this.task.estado = 'A';
        }
    }

    onSubmit(): void {
        this.cargando = true;

        const request$ = this.task.llaveTabla
            ? this.service.updateAutoTask(this.task)
            : this.service.createAutoTask(this.task);

        request$.subscribe({
            next: (result) => {
                this.cargando = false;
                this.notificationCenter.fire('Éxito', 'Tarea automática guardada correctamente', 'success');
                this.dialogRef.close(result);
            },
            error: (err) => {
                this.cargando = false;
                this.notificationCenter.fire('Error', 'No se pudo guardar la tarea automática', 'error');
            }
        });
    }
}
