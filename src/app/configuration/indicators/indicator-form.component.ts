import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { IndicatorDTO } from '../configuration.types';
import { IndicatorConfigService } from '../configuracion.api';
import { ImageUploaderComponent } from '../../upload/image-uploader/image-uploader.component';
import { ProcessSelectorComponent } from '../shared/process-selector.component';
import { PropertyPanelComponent } from '../shared/property-panel.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-indicator-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule, ImageUploaderComponent, ProcessSelectorComponent],
  template: `
    <div class="max-w-3xl w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 space-y-6 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
        <h2 class="text-xl font-bold">{{ data?.llaveTabla ? 'Editar Indicador' : 'Nuevo Indicador' }}</h2>
        <button type="button" class="btn-icon" (click)="dialogRef.close()" aria-label="Cerrar" title="Cerrar"><mat-icon>close</mat-icon></button>
      </div>

      <form #form="ngForm" (ngSubmit)="onSubmit()">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-1 flex flex-col items-center">
            <label class="block text-sm font-semibold mb-1">Imagen / Icono</label>
            <app-image-uploader [(value)]="indicador.imagen"></app-image-uploader>
          </div>
          <div class="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <app-process-selector [(ngModel)]="indicador.proceso" name="proceso"></app-process-selector>
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1">Código *</label>
              <input type="text" [(ngModel)]="indicador.codigo" name="codigo" required class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="ej. ventas_totales" />
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1">Nombre *</label>
              <input type="text" [(ngModel)]="indicador.nombre" name="nombre" required class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4">
          <button type="button" class="btn-flat" (click)="openPropiedades()" [disabled]="!indicador.llaveTabla"><mat-icon>tune</mat-icon> Propiedades</button>
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
  private dialog = inject(MatDialog);
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

  openPropiedades(): void {
    if (!this.indicador.llaveTabla) return;
    this.dialog.open(PropertyPanelComponent, {
      width: '800px', maxWidth: '95vw', maxHeight: '90vh', disableClose: true,
      data: { campoKey: this.indicador.llaveTabla, tipoOrigen: 'I', titulo: this.indicador.nombre }
    });
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
