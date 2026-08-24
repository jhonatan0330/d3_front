import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { OrganizacionDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { PropertyFieldComponent } from '../shared/property-field.component';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-organization-form',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatCheckboxModule, PropertyFieldComponent],
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
            <label class="block text-sm font-semibold mb-1">Código *</label>
            <input type="text" [(ngModel)]="organizacion.codigo" name="codigo" required class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-semibold mb-1">NIT *</label>
            <input type="text" [(ngModel)]="organizacion.nit" name="nit" required class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div class="sm:col-span-2">
            <label class="block text-sm font-semibold mb-1">Dirección</label>
            <input type="text" [(ngModel)]="organizacion.direccion" name="direccion" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-semibold mb-1">Teléfono</label>
            <input type="text" [(ngModel)]="organizacion.telefono" name="telefono" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-semibold mb-1">Email</label>
            <input type="email" [(ngModel)]="organizacion.email" name="email" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div class="sm:col-span-2">
            <label class="block text-sm font-semibold mb-1">Logo (URL)</label>
            <input type="text" [(ngModel)]="organizacion.logo" name="logo" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div class="flex items-center gap-2">
          <input type="checkbox" [(ngModel)]="organizacion.principal" name="principal" id="principal" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
          <label for="principal" class="text-sm">Organización Principal</label>
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
    styles: [`
    .btn-flat { padding: 0.5rem 1.5rem; border-radius: 4px; font-weight: 500; border: 1px solid #e0e0e0; background: white; color: #333; }
    .btn-flat:hover { background: #f5f5f5; }
    .btn-flat-primary { padding: 0.5rem 1.5rem; border-radius: 4px; font-weight: 500; background: #3f51b5; color: white; border: none; }
    .btn-flat-primary:hover:not(:disabled) { background: #303f9f; }
    .btn-flat-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
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
            this.organizacion.principal = false;
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