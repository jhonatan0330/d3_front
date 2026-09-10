import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { IndicatorDTO } from '../configuration.types';
import { IndicatorConfigService } from '../configuracion.api';
import { ImageUploaderComponent } from '../../upload/image-uploader/image-uploader.component';
import { ProcessSelectorComponent } from '../shared/process-selector.component';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-indicator-form',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, ImageUploaderComponent, ProcessSelectorComponent],
    template: `
    <div class="max-w-3xl w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 space-y-6 max-h-[90vh] overflow-y-auto">
      <h2 class="text-xl font-bold border-b border-gray-200 dark:border-gray-700 pb-2">{{ data?.llaveTabla ? 'Editar Indicador' : 'Nuevo Indicador' }}</h2>

      <form #form="ngForm" (ngSubmit)="onSubmit()">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold mb-1">Nombre *</label>
            <input type="text" [(ngModel)]="indicador.nombre" name="nombre" required class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-semibold mb-1">Código *</label>
            <input type="text" [(ngModel)]="indicador.codigo" name="codigo" required class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="ej. ventas_totales" />
          </div>
          <div>
            <app-process-selector [(ngModel)]="indicador.proceso" name="proceso"></app-process-selector>
          </div>
          <div>
            <label class="block text-sm font-semibold mb-1">Imagen / Icono</label>
            <app-image-uploader [(value)]="indicador.imagen"></app-image-uploader>
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
export class IndicatorFormComponent implements OnInit {
    public dialogRef = inject<MatDialogRef<IndicatorFormComponent>>(MatDialogRef);
    public data = inject<IndicatorDTO | null>(MAT_DIALOG_DATA);
    private service = inject(IndicatorConfigService);

    indicador: IndicatorDTO = new IndicatorDTO();
    cargando = false;

    ngOnInit(): void {
        if (this.data) {
            this.indicador = { ...this.data, propiedades: this.data.propiedades || [] };
        } else {
            this.indicador = new IndicatorDTO();
            this.indicador.estado = 'A';
            this.indicador.propiedades = [];
        }
    }

    onSubmit(): void {
        this.cargando = true;
        const request = this.indicador.llaveTabla
            ? this.service.updateIndicador(this.indicador)
            : this.service.createIndicador(this.indicador);
        request.subscribe({
            next: (res) => {
                this.cargando = false;
                Swal.fire('Éxito', this.indicador.llaveTabla ? 'Indicador actualizado correctamente' : 'Indicador creado correctamente', 'success');
                this.dialogRef.close(res);
            },
            error: () => {
                this.cargando = false;
                Swal.fire('Error', 'No se pudo guardar el indicador', 'error');
            },
        });
    }
}
