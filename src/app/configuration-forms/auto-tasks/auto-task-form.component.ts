import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ProcesoTransicionAutomaticaDTO } from 'app/modules/full/neuron/model/sw42.domain';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-auto-task-form',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule],
    template: `
    <div class="max-w-2xl w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
      <h2 class="text-xl font-bold border-b border-gray-200 dark:border-gray-700 pb-2">
        {{ data?.llaveTabla ? 'Editar Tarea Automática' : 'Nueva Tarea Automática' }}
      </h2>

      <form #form="ngForm" (ngSubmit)="onSubmit()">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold mb-1">Nombre *</label>
            <input type="text" [(ngModel)]="task.nombre" name="nombre" required class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold mb-1">Proceso *</label>
              <input type="text" [(ngModel)]="task.proceso" name="proceso" required class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Llave del proceso" />
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1">Proceso Nombre</label>
              <input type="text" [(ngModel)]="task.procesoNombre" name="procesoNombre" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold mb-1">Estado Origen *</label>
              <input type="text" [(ngModel)]="task.estadoOrigen" name="estadoOrigen" required class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Llave estado origen" />
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1">Estado Origen Nombre</label>
              <input type="text" [(ngModel)]="task.estadoOrigenNombre" name="estadoOrigenNombre" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold mb-1">Estado Destino *</label>
              <input type="text" [(ngModel)]="task.estadoDestino" name="estadoDestino" required class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Llave estado destino" />
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1">Estado Destino Nombre</label>
              <input type="text" [(ngModel)]="task.estadoDestinoNombre" name="estadoDestinoNombre" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold mb-1">Condición (expresión)</label>
            <textarea [(ngModel)]="task.condicion" name="condicion" rows="3" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm" placeholder="Expresión de condición para la transición automática"></textarea>
          </div>

          <div>
            <label class="block text-sm font-semibold mb-1">Programación (Cron)</label>
            <input type="text" [(ngModel)]="task.programa" name="programa" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm" placeholder="Ej: 0 0 * * * (diario medianoche)" />
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Expresión Cron estándar. Vacío = solo manual.</p>
          </div>

          <div class="flex items-center gap-2">
            <input type="checkbox" [(ngModel)]="task.activa" name="activa" id="activa" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
            <label for="activa" class="text-sm">Tarea Activa</label>
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

    task: ProcesoTransicionAutomaticaDTO = new ProcesoTransicionAutomaticaDTO();
    cargando = false;

    ngOnInit(): void {
        if (this.data) {
            this.task = { ...this.data };
        } else {
            this.task = new ProcesoTransicionAutomaticaDTO();
            this.task.estado = 'A';
            this.task.activa = false;
        }
    }

    onSubmit(): void {
        this.cargando = true;
        this.dialogRef.close(this.task);
    }
}