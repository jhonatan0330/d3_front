import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ConsecutivoDTO } from 'app/document/model/sw42.domain';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-consecutive-form',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule],
    template: `
    <div class="max-w-md w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 space-y-4">
      <h2 class="text-xl font-bold border-b border-gray-200 dark:border-gray-700 pb-2">
        {{ data?.llaveTabla ? 'Editar Consecutivo' : 'Nuevo Consecutivo' }}
      </h2>

      <form #form="ngForm" (ngSubmit)="onSubmit()">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold mb-1">Nombre *</label>
            <input type="text"
              [(ngModel)]="consecutivo.nombre"
              name="nombre"
              required
              class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label class="block text-sm font-semibold mb-1">Prefijo *</label>
            <input type="text"
              [(ngModel)]="consecutivo.prefijo"
              name="prefijo"
              required
              class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold mb-1">Consecutivo Inicial *</label>
              <input type="number" min="0"
                [(ngModel)]="consecutivo.consecutivo"
                name="consecutivo"
                required
                class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1">Longitud *</label>
              <input type="number" min="1"
                [(ngModel)]="consecutivo.longitud"
                name="longitud"
                required
                class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold mb-1">Formato</label>
            <input type="text"
              [(ngModel)]="consecutivo.formato"
              name="formato"
              placeholder="Ej: {{ consecutivo.prefijo }}-00001"
              class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div class="flex items-center gap-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" [(ngModel)]="consecutivo.reinicioAnual" name="reinicioAnual" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
              <span class="text-sm">Reinicio Anual</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" [(ngModel)]="consecutivo.reinicioMensual" name="reinicioMensual" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
              <span class="text-sm">Reinicio Mensual</span>
            </label>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button type="button" class="btn-flat" (click)="dialogRef.close()">Cancelar</button>
          <button type="submit" class="btn-flat-primary" [disabled]="cargando || !form.valid">
            {{ cargando ? 'Guardando...' : (data?.llaveTabla ? 'Actualizar' : 'Crear') }}
          </button>
        </div>
      </form>
    </div>
  `,
    styles: []
})
export class ConsecutiveFormComponent implements OnInit {
    public dialogRef = inject<MatDialogRef<ConsecutiveFormComponent>>(MatDialogRef);
    public data = inject<ConsecutivoDTO | null>(MAT_DIALOG_DATA);

    consecutivo: ConsecutivoDTO = new ConsecutivoDTO();
    cargando = false;

    ngOnInit(): void {
        if (this.data) {
            this.consecutivo = { ...this.data };
        } else {
            this.consecutivo = new ConsecutivoDTO();
            this.consecutivo.estado = 'A';
            this.consecutivo.consecutivo = 0;
            this.consecutivo.longitud = 6;
            this.consecutivo.reinicioAnual = false;
            this.consecutivo.reinicioMensual = false;
        }
    }

    onSubmit(): void {
        this.cargando = true;
        this.dialogRef.close(this.consecutivo);
    }
}