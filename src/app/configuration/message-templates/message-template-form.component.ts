import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MensajePlantillaCorreoDTO } from 'app/document/model/sw42.domain';
import { PropertyFieldComponent } from '../shared/property-field.component';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-message-template-form',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatFormFieldModule, MatSelectModule, PropertyFieldComponent],
    template: `
    <div class="max-w-3xl w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 space-y-6 max-h-[90vh] overflow-y-auto">
      <h2 class="text-xl font-bold border-b border-gray-200 dark:border-gray-700 pb-2">
        {{ data?.llaveTabla ? 'Editar Plantilla' : 'Nueva Plantilla' }}
      </h2>

      <form #form="ngForm" (ngSubmit)="onSubmit()">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold mb-1">Nombre *</label>
            <input type="text" [(ngModel)]="template.nombre" name="nombre" required class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label class="block text-sm font-semibold mb-1">Tipo *</label>
            <mat-form-field appearance="outline" class="w-full">
              <mat-select [(ngModel)]="template.tipo" name="tipo" required>
                <mat-option value="EMAIL">Email</mat-option>
                <mat-option value="SMS">SMS</mat-option>
                <mat-option value="PUSH">Push</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div>
            <label class="block text-sm font-semibold mb-1">Asunto *</label>
            <input type="text" [(ngModel)]="template.asunto" name="asunto" required class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label class="block text-sm font-semibold mb-1">Cuerpo *</label>
            <textarea [(ngModel)]="template.cuerpo" name="cuerpo" required rows="6" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
          </div>

          <div>
            <label class="block text-sm font-semibold mb-1">Adjuntos (rutas separadas por coma)</label>
            <input type="text" [(ngModel)]="template.adjuntos" name="adjuntos" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="/ruta/archivo1.pdf,/ruta/archivo2.jpg" />
          </div>

          <app-property-field
            [propiedades]="template.propiedades || []"
            [tipoOrigen]="'M'"
            [campoKey]="template.llaveTabla || ''"
            (propiedadesChange)="onPropiedadesChange($event)">
          </app-property-field>
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
export class MessageTemplateFormComponent implements OnInit {
    public dialogRef = inject<MatDialogRef<MessageTemplateFormComponent>>(MatDialogRef);
    public data = inject<MensajePlantillaCorreoDTO | null>(MAT_DIALOG_DATA);

    template: MensajePlantillaCorreoDTO = new MensajePlantillaCorreoDTO();
    cargando = false;

    ngOnInit(): void {
        if (this.data) {
            this.template = { ...this.data };
        } else {
            this.template = new MensajePlantillaCorreoDTO();
            this.template.estado = 'A';
            this.template.tipo = 'EMAIL';
            this.template.propiedades = [];
        }
    }

    onPropiedadesChange(props: any[]): void {
        this.template.propiedades = props;
    }

    onSubmit(): void {
        this.cargando = true;
        this.dialogRef.close(this.template);
    }
}