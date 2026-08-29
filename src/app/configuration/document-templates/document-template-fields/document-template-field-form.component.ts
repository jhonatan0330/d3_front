import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { DocumentoPlantillaCaracteristicaDTO, DocumentoPlantillaDTO } from 'app/document/model/sw42.domain';
import { FormatoCampoSimboloEnum, DocumentoPlantillaCaracteristicaEnum } from 'app/document/model/sw42.enum';
import Swal from 'sweetalert2';

interface FieldFormData {
    field?: DocumentoPlantillaCaracteristicaDTO;
    template: DocumentoPlantillaDTO;
}

@Component({
    selector: 'app-document-template-field-form',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule],
    template: `
    <div class="max-w-2xl w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
      <h2 class="text-xl font-bold border-b border-gray-200 dark:border-gray-700 pb-2">
        {{ data.field?.llaveTabla ? 'Editar Campo' : 'Nuevo Campo' }}
      </h2>

      <form #form="ngForm" (ngSubmit)="onSubmit()">
        <div class="space-y-4">
          <div class="flex items-center gap-4">
            <div class="flex-1">
              <label class="block text-sm font-semibold mb-1">Formato</label>
              <div class="relative">
                <select [(ngModel)]="field.formato" name="formato" required class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-10">
                  @for (f of formatos; track f) {
                    <option [value]="f">{{ getFormatoLabel(f) }} ({{ getFormatoIcon(f) }})</option>
                  }
                </select>
                <div class="absolute right-3 top-1/2 -translate-y-1/2 text-2xl pointer-events-none">{{ getFormatoIcon(field.formato) }}</div>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold mb-1">Nombre *</label>
            <input type="text" [(ngModel)]="field.nombre" name="nombre" required class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label class="block text-sm font-semibold mb-1">Código</label>
            <input type="text" [(ngModel)]="field.codigo" name="codigo" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Código único para el campo" />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold mb-1">Orden</label>
              <input type="number" [(ngModel)]="field.orden" name="orden" min="1" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1">Imagen (URL)</label>
              <input type="text" [(ngModel)]="field.imagen" name="imagen" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          @if (field.formato === 'D' || field.formato === 'P') {
            <div>
              <label class="block text-sm font-semibold mb-1">Productos / Detalle</label>
              <p class="text-sm text-gray-500 dark:text-gray-400">Configuración de productos se maneja en el formulario principal</p>
            </div>
          }

          @if (field.formato === 'T' || field.formato === 'N') {
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold mb-1">Longitud Máxima</label>
                <input type="number" [(ngModel)]="field.longitudMaxima" name="longitudMaxima" min="1" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label class="block text-sm font-semibold mb-1">Valor Por Defecto</label>
                <input type="text" [(ngModel)]="field.valorPorDefecto" name="valorPorDefecto" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          }

          @if (field.formato === 'O' || field.formato === 'M') {
            <div>
              <label class="block text-sm font-semibold mb-1">Opciones (JSON)</label>
              <textarea [(ngModel)]="field.opciones" name="opciones" rows="4" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm" placeholder='[{"value": "1", "label": "Opción 1"}, {"value": "2", "label": "Opción 2"}]'></textarea>
            </div>
          }

          <div>
            <label class="block text-sm font-semibold mb-1">Validación (Regex)</label>
            <input type="text" [(ngModel)]="field.validacion" name="validacion" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm" placeholder="Ej: ^[0-9]{10}$" />
          </div>

          <div class="flex items-center gap-2">
            <input type="checkbox" [(ngModel)]="field.requerido" name="requerido" id="requerido" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
            <label for="requerido" class="text-sm">Campo Requerido</label>
            <input type="checkbox" [(ngModel)]="field.soloLectura" name="soloLectura" id="soloLectura" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ml-4" />
            <label for="soloLectura" class="text-sm">Solo Lectura</label>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button type="button" class="btn-flat" (click)="dialogRef.close()">Cancelar</button>
          <button type="submit" class="btn-flat-primary" [disabled]="cargando || !form.valid">{{ cargando ? 'Guardando...' : (data.field?.llaveTabla ? 'Actualizar' : 'Crear') }}</button>
        </div>
      </form>
    </div>
  `,
    styles: []
})
export class DocumentTemplateFieldFormComponent implements OnInit {
    public dialogRef = inject<MatDialogRef<DocumentTemplateFieldFormComponent>>(MatDialogRef);
    public data = inject<FieldFormData>(MAT_DIALOG_DATA);

    field: DocumentoPlantillaCaracteristicaDTO = new DocumentoPlantillaCaracteristicaDTO();
    cargando = false;
    formatos = Object.keys(FormatoCampoSimboloEnum) as (keyof typeof FormatoCampoSimboloEnum)[];

    ngOnInit(): void {
        if (this.data.field) {
            this.field = { ...this.data.field };
        } else {
            this.field = new DocumentoPlantillaCaracteristicaDTO();
            this.field.estado = 'A';
            this.field.formato = 'T';
            this.field.plantilla = this.data.template.llaveTabla;
            this.field.orden = (this.data.template.caracteristicas?.length || 0) + 1;
            this.field.requerido = false;
            this.field.soloLectura = false;
        }
    }

    getFormatoIcon(formato: string): string {
        return FormatoCampoSimboloEnum[formato as keyof typeof FormatoCampoSimboloEnum] ?? '?';
    }

    getFormatoLabel(formato: string): string {
        const entry = Object.entries(DocumentoPlantillaCaracteristicaEnum).find(([key, value]) => value === formato);
        return entry ? entry[0] : formato;
    }

    onSubmit(): void {
        this.cargando = true;
        this.dialogRef.close(this.field);
    }
}