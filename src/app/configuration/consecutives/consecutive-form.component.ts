import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ConsecutivoDTO } from 'app/document/document.types';
import { ConsecutiveService } from '../configuracion.api';
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

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold mb-1">Prefijo</label>
              <input type="text"
                [(ngModel)]="consecutivo.prefijo"
                name="prefijo"
                class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1">Sufijo</label>
              <input type="text"
                [(ngModel)]="consecutivo.sufijo"
                name="sufijo"
                class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold mb-1">Número Inicial</label>
              <input type="number" min="0"
                [(ngModel)]="consecutivo.numeroInicial"
                name="numeroInicial"
                class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1">Número Final</label>
              <input type="number" min="0"
                [(ngModel)]="consecutivo.numeroFinal"
                name="numeroFinal"
                class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold mb-1">Número Actual</label>
              <input type="number" min="0"
                [(ngModel)]="consecutivo.numeroActual"
                name="numeroActual"
                class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1">Padding</label>
              <input type="number" min="0"
                [(ngModel)]="consecutivo.padding"
                name="padding"
                class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold mb-1">Consecutivo Actual</label>
            <input type="text"
              [(ngModel)]="consecutivo.consecutivoActual"
              name="consecutivoActual"
              class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div class="flex items-center gap-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" [(ngModel)]="consecutivo.manual" name="manual" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
              <span class="text-sm">Manual</span>
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

    private service = inject(ConsecutiveService);

    consecutivo: ConsecutivoDTO = new ConsecutivoDTO();
    cargando = false;

    ngOnInit(): void {
        if (this.data) {
            this.consecutivo = { ...this.data };
        } else {
            this.consecutivo = new ConsecutivoDTO();
            this.consecutivo.estado = 'A';
            this.consecutivo.manual = false;
            this.consecutivo.numeroInicial = 0;
            this.consecutivo.numeroFinal = 0;
            this.consecutivo.numeroActual = 0;
            this.consecutivo.padding = 0;
            this.consecutivo.consecutivoActual = '';
        }
    }

    onSubmit(): void {
        this.cargando = true;

        const request$ = this.consecutivo.llaveTabla
            ? this.service.updateConsecutivo(this.consecutivo)
            : this.service.createConsecutivo(this.consecutivo);

        request$.subscribe({
            next: (result) => {
                this.cargando = false;
                Swal.fire('Éxito', 'Consecutivo guardado correctamente', 'success');
                this.dialogRef.close(result);
            },
            error: (err) => {
                this.cargando = false;
                Swal.fire('Error', 'No se pudo guardar el consecutivo', 'error');
            }
        });
    }
}