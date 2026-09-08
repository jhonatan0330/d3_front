import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { WebServiceDTO } from 'app/document/document.types';
import { ProcessSelectorComponent } from '../shared/process-selector.component';

@Component({
    selector: 'app-web-service-form',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, ProcessSelectorComponent],
    template: `
    <div class="max-w-2xl w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 space-y-6 max-h-[90vh] overflow-y-auto">
      <h2 class="text-xl font-bold border-b border-gray-200 dark:border-gray-700 pb-2">
        {{ data?.llaveTabla ? 'Editar Web Service' : 'Nuevo Web Service' }}
      </h2>

      <form #form="ngForm" (ngSubmit)="onSubmit()">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold mb-1">Nombre *</label>
            <input type="text" [(ngModel)]="ws.nombre" name="nombre" required class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold mb-1">Código</label>
              <input type="text" [(ngModel)]="ws.codigo" name="codigo" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1">Proceso</label>
              <app-process-selector [(ngModel)]="ws.proceso" name="proceso"></app-process-selector>
            </div>
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
export class WebServiceFormComponent implements OnInit {
    public dialogRef = inject<MatDialogRef<WebServiceFormComponent>>(MatDialogRef);
    public data = inject<WebServiceDTO | null>(MAT_DIALOG_DATA);

    ws: WebServiceDTO = new WebServiceDTO();
    cargando = false;

    ngOnInit(): void {
        if (this.data) {
            this.ws = { ...this.data };
        } else {
            this.ws = new WebServiceDTO();
            this.ws.estado = 'A';
        }
    }

    onSubmit(): void {
        this.cargando = true;
        this.dialogRef.close(this.ws);
    }
}