import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ProcesoTransicionAutomaticaDTO } from 'app/document/document.types';
import { AutoTaskService } from '../configuracion.api';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-auto-task-form',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule],
    template: `
    <div class=" w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 space-y-4 max-h-[90vh] flex flex-col overflow-hidden">
      <div class="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
        <h2 class="text-xl font-bold">{{ data?.llaveTabla ? 'Editar Tarea Automática' : 'Nueva Tarea Automática' }}</h2>
        <button type="button" class="btn-icon" (click)="dialogRef.close()" aria-label="Cerrar" title="Cerrar"><mat-icon>close</mat-icon></button>
      </div>

      <form #form="ngForm" (ngSubmit)="onSubmit()" class="flex-1 overflow-y-auto">
        <div class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold mb-1">Fecha *</label>
              <input type="date" [(ngModel)]="task.fecha" name="fecha" required class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1">Transición</label>
              <input type="text" [(ngModel)]="task.transicion" name="transicion" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Llave de la transición" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold mb-1">Plantilla</label>
              <input type="text" [(ngModel)]="task.plantilla" name="plantilla" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Llave de la plantilla" />
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1">Plantilla Nombre</label>
              <input type="text" [(ngModel)]="task.plantillaNombre" name="plantillaNombre" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold mb-1">Propiedad</label>
              <input type="text" [(ngModel)]="task.propiedad" name="propiedad" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Llave de la propiedad" />
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1">Ejecución</label>
              <input type="text" [(ngModel)]="task.ejecucion" name="ejecucion" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold mb-1">Mensaje</label>
            <textarea [(ngModel)]="task.mensaje" name="mensaje" rows="3" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Mensaje de la tarea"></textarea>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button type="button" class="btn-flat" (click)="dialogRef.close()">Cancelar</button>
          <button type="submit" class="btn-flat-primary" [disabled]="cargando || !form.valid">{{ cargando ? 'Guardando...' : (data?.llaveTabla ? 'Actualizar' : 'Crear') }}</button>
        </div>
      </form>
    </div>
  `,
    styles: []
})
export class AutoTaskFormComponent implements OnInit {
    public dialogRef = inject<MatDialogRef<AutoTaskFormComponent>>(MatDialogRef);
    public data = inject<ProcesoTransicionAutomaticaDTO | null>(MAT_DIALOG_DATA);

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
                Swal.fire('Éxito', 'Tarea automática guardada correctamente', 'success');
                this.dialogRef.close(result);
            },
            error: (err) => {
                this.cargando = false;
                Swal.fire('Error', 'No se pudo guardar la tarea automática', 'error');
            }
        });
    }
}
