import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ProcesoTransicionAutomaticaDTO } from 'app/document/document.types';
import { AutoTaskService } from 'app/configuration/configuracion.api';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';
import { IdDialogData } from '../../shared/dialog-data';

@Component({
    selector: 'app-auto-task-form',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule],
    templateUrl: './auto-task-form.component.html',
})
export class AutoTaskFormComponent implements OnInit {
    public dialogRef = inject<MatDialogRef<AutoTaskFormComponent>>(MatDialogRef);
    public data = inject<IdDialogData | null>(MAT_DIALOG_DATA);
    private notificationCenter = inject(NotificationCenterService);
    private service = inject(AutoTaskService);
    private cdr = inject(ChangeDetectorRef);

    task: ProcesoTransicionAutomaticaDTO = new ProcesoTransicionAutomaticaDTO();
    cargando = false;

    ngOnInit(): void {
        if (this.data?.id) {
            this.loadTask(this.data.id);
            return;
        }
        this.task = new ProcesoTransicionAutomaticaDTO();
        this.task.estado = 'A';
    }

    private loadTask(id: string): void {
        this.cargando = true;
        this.service.getAutoTaskById(id).subscribe({
            next: (result) => {
                this.cargando = false;
                if (!result) {
                    this.notificationCenter.error('Tarea no encontrada', 'No existe una tarea automática con la clave solicitada.');
                    this.dialogRef.close();
                    return;
                }
                this.task = { ...result };
                this.cdr.markForCheck();
            },
            error: () => {
                this.cargando = false;
                this.notificationCenter.error('Error', 'No se pudo cargar la tarea automática.');
                this.dialogRef.close();
            }
        });
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
            }
        });
    }
}
