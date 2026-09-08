import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { OrganizacionDTO } from 'app/document/document.types';
import { PropertyFieldComponent } from '../shared/property-field.component';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-organization-form',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, PropertyFieldComponent],
    template: `
    <div class="max-w-3xl w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 space-y-6 max-h-[90vh] overflow-y-auto">
      <h2 class="text-xl font-bold border-b border-gray-200 dark:border-gray-700 pb-2">
        {{ data?.llaveTabla ? 'Editar Organización' : 'Nueva Organización' }}
      </h2>

      <form #form="ngForm" (ngSubmit)="onSubmit()">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="sm:col-span-2">
            <label class="block text-sm font-semibold mb-1">Nombre *</label>
            <input type="text" [(ngModel)]="organizacion.nombre" name="nombre" required class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-semibold mb-1">Código</label>
            <input type="text" [(ngModel)]="organizacion.codigo" name="codigo" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-semibold mb-1">Principal</label>
            <input type="text" [(ngModel)]="organizacion.principal" name="principal" placeholder="Llave de la organización principal" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-semibold mb-1">Servidor</label>
            <input type="text" [(ngModel)]="organizacion.servidor" name="servidor" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-semibold mb-1">Usuario System</label>
            <input type="text" [(ngModel)]="organizacion.usuarioSystem" name="usuarioSystem" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div class="sm:col-span-2">
            <label class="block text-sm font-semibold mb-1">Imagen (URL)</label>
            <input type="text" [(ngModel)]="organizacion.imagen" name="imagen" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div class="sm:col-span-2">
            <label class="block text-sm font-semibold mb-1">Slogan</label>
            <input type="text" [(ngModel)]="organizacion.slogan" name="slogan" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div class="sm:col-span-2">
            <label class="block text-sm font-semibold mb-1">Mensaje Ingreso</label>
            <input type="text" [(ngModel)]="organizacion.mensajeIngreso" name="mensajeIngreso" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div class="sm:col-span-2">
            <label class="block text-sm font-semibold mb-1">Public Token</label>
            <input type="text" [(ngModel)]="organizacion.publicToken" name="publicToken" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <!-- PropertyField para propiedades de la organización -->
        <app-property-field
          [propiedades]="organizacion.propiedades || []"
          [tipoOrigen]="'L'"
          [campoKey]="organizacion.llaveTabla || ''"
          (propiedadesChange)="onPropiedadesChange($event)">
        </app-property-field>

        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button type="button" class="btn-flat" (click)="dialogRef.close()">Cancelar</button>
          <button type="submit" class="btn-flat-primary" [disabled]="cargando || !form.valid">{{ cargando ? 'Guardando...' : (data?.llaveTabla ? 'Actualizar' : 'Crear') }}</button>
        </div>
      </form>
    </div>
  `,
    styles: []
})
export class OrganizationFormComponent implements OnInit {
    public dialogRef = inject<MatDialogRef<OrganizationFormComponent>>(MatDialogRef);
    public data = inject<OrganizacionDTO | null>(MAT_DIALOG_DATA);

    organizacion: OrganizacionDTO = new OrganizacionDTO();
    cargando = false;

    ngOnInit(): void {
        if (this.data) {
            this.organizacion = { ...this.data };
        } else {
            this.organizacion = new OrganizacionDTO();
            this.organizacion.estado = 'A';
            this.organizacion.propiedades = [];
        }
    }

    onPropiedadesChange(props: any[]): void {
        this.organizacion.propiedades = props;
    }

    onSubmit(): void {
        this.cargando = true;
        this.dialogRef.close(this.organizacion);
    }
}