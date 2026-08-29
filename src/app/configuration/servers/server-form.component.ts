import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ServidorDTO } from 'app/document/model/sw42.domain';
import { PropertyFieldComponent } from '../shared/property-field.component';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-server-form',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatFormFieldModule, MatSelectModule, PropertyFieldComponent],
    template: `
    <div class="max-w-3xl w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 space-y-6 max-h-[90vh] overflow-y-auto">
      <h2 class="text-xl font-bold border-b border-gray-200 dark:border-gray-700 pb-2">{{ data?.llaveTabla ? 'Editar Servidor' : 'Nuevo Servidor' }}</h2>

      <form #form="ngForm" (ngSubmit)="onSubmit()">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold mb-1">Nombre *</label>
            <input type="text" [(ngModel)]="servidor.nombre" name="nombre" required class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-semibold mb-1">Tipo *</label>
            <mat-form-field appearance="outline" class="w-full"><mat-select [(ngModel)]="servidor.tipo" name="tipo" required><mat-option value="DB">Base de Datos</mat-option><mat-option value="APP">Aplicación</mat-option><mat-option value="WEB">Web</mat-option><mat-option value="MAIL">Correo</mat-option></mat-select></mat-form-field>
          </div>
          <div class="sm:col-span-2">
            <label class="block text-sm font-semibold mb-1">URL *</label>
            <input type="text" [(ngModel)]="servidor.url" name="url" required class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-semibold mb-1">Puerto *</label>
            <input type="number" [(ngModel)]="servidor.puerto" name="puerto" required class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-semibold mb-1">Base de Datos</label>
            <input type="text" [(ngModel)]="servidor.baseDatos" name="baseDatos" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-semibold mb-1">Usuario</label>
            <input type="text" [(ngModel)]="servidor.usuario" name="usuario" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-semibold mb-1">Clave</label>
            <input type="password" [(ngModel)]="servidor.clave" name="clave" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div class="flex items-center gap-2">
          <input type="checkbox" [(ngModel)]="servidor.activo" name="activo" id="activo" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
          <label for="activo" class="text-sm">Activo</label>
        </div>

        <app-property-field [propiedades]="servidor.propiedades || []" [tipoOrigen]="'S'" [campoKey]="servidor.llaveTabla || ''" (propiedadesChange)="onPropiedadesChange($event)"></app-property-field>

        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button type="button" class="btn-flat" (click)="dialogRef.close()">Cancelar</button>
          <button type="submit" class="btn-flat-primary" [disabled]="cargando || !form.valid">{{ cargando ? 'Guardando...' : (data?.llaveTabla ? 'Actualizar' : 'Crear') }}</button>
        </div>
      </form>
    </div>
  `,
    styles: []
})
export class ServerFormComponent implements OnInit {
    public dialogRef = inject<MatDialogRef<ServerFormComponent>>(MatDialogRef);
    public data = inject<ServidorDTO | null>(MAT_DIALOG_DATA);

    servidor: ServidorDTO = new ServidorDTO();
    cargando = false;

    ngOnInit(): void {
        if (this.data) { this.servidor = { ...this.data }; }
        else {
            this.servidor = new ServidorDTO();
            this.servidor.estado = 'A';
            this.servidor.activo = true;
            this.servidor.puerto = 5432;
            this.servidor.propiedades = [];
        }
    }

    onPropiedadesChange(props: any[]): void { this.servidor.propiedades = props; }

    onSubmit(): void { this.cargando = true; this.dialogRef.close(this.servidor); }
}