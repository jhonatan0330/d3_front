import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { PropiedadValorDefinidoDTO } from 'app/shared/shared.domain';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-property-value-form',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatFormFieldModule, MatSelectModule],
    template: `
    <div class="max-w-2xl w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 space-y-4">
      <h2 class="text-xl font-bold border-b border-gray-200 dark:border-gray-700 pb-2">
        {{ data?.llaveTabla ? 'Editar Valor Definido' : 'Nuevo Valor Definido' }}
      </h2>

      <form #form="ngForm" (ngSubmit)="onSubmit()">
        <div class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold mb-1">Origen *</label>
              <mat-form-field appearance="outline" class="w-full">
                <mat-select [(ngModel)]="valor.origen" name="origen" required>
                  <mat-option value="C">Campo (C)</mat-option>
                  <mat-option value="L">Plantilla (L)</mat-option>
                  <mat-option value="P">Proceso (P)</mat-option>
                  <mat-option value="D">Documento (D)</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1">Categoría Origen</label>
              <input type="text" [(ngModel)]="valor.origenCategoria" name="origenCategoria" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold mb-1">Código *</label>
              <input type="text" [(ngModel)]="valor.codigo" name="codigo" required class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1">Nombre *</label>
              <input type="text" [(ngModel)]="valor.nombre" name="nombre" required class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold mb-1">Grupo</label>
            <input type="text" [(ngModel)]="valor.grupo" name="grupo" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" [(ngModel)]="valor.pideRol" name="pideRol" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" /><span class="text-sm">Pide Rol</span></label>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" [(ngModel)]="valor.pideUsuario" name="pideUsuario" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" /><span class="text-sm">Pide Usuario</span></label>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" [(ngModel)]="valor.pideFechas" name="pideFechas" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" /><span class="text-sm">Pide Fechas</span></label>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" [(ngModel)]="valor.pideTiempoBloqueo" name="pideTiempoBloqueo" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" /><span class="text-sm">Pide Bloqueo</span></label>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" [(ngModel)]="valor.multiple" name="multiple" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" /><span class="text-sm">Múltiple</span></label>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" [(ngModel)]="valor.propiedadBoolean" name="propiedadBoolean" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" /><span class="text-sm">Boolean</span></label>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" [(ngModel)]="valor.necesitaDesarrollo" name="necesitaDesarrollo" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" /><span class="text-sm">Necesita Desarrollo</span></label>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" [(ngModel)]="valor.textOculto" name="textOculto" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" /><span class="text-sm">Texto Oculto</span></label>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" [(ngModel)]="valor.incluirPreloadOrigen" name="incluirPreloadOrigen" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" /><span class="text-sm">Preload Origen</span></label>
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
export class PropertyValueFormComponent implements OnInit {
    public dialogRef = inject<MatDialogRef<PropertyValueFormComponent>>(MatDialogRef);
    public data = inject<PropiedadValorDefinidoDTO | null>(MAT_DIALOG_DATA);

    valor: PropiedadValorDefinidoDTO = new PropiedadValorDefinidoDTO();
    cargando = false;

    ngOnInit(): void {
        if (this.data) {
            this.valor = { ...this.data };
        } else {
            this.valor = new PropiedadValorDefinidoDTO();
            this.valor.estado = 'A';
            this.valor.pideRol = false;
            this.valor.pideUsuario = false;
            this.valor.pideFechas = false;
            this.valor.pideTiempoBloqueo = false;
            this.valor.multiple = false;
            this.valor.propiedadBoolean = false;
            this.valor.necesitaDesarrollo = false;
            this.valor.textOculto = false;
            this.valor.incluirPreloadOrigen = false;
        }
    }

    onSubmit(): void {
        this.cargando = true;
        this.dialogRef.close(this.valor);
    }
}