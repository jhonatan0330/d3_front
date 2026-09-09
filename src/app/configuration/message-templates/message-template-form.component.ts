import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MensajePlantillaCorreoDTO } from 'app/document/document.types';
import { MessageTemplateService } from '../configuracion.api';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-message-template-form',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatFormFieldModule, MatSelectModule],
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
            <label class="block text-sm font-semibold mb-1">Título</label>
            <input type="text" [(ngModel)]="template.titulo" name="titulo" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label class="block text-sm font-semibold mb-1">Texto</label>
            <textarea [(ngModel)]="template.texto" name="texto" rows="6" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
          </div>

          <div>
            <label class="block text-sm font-semibold mb-1">Servidor</label>
            <input type="text" [(ngModel)]="template.servidor" name="servidor" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
export class MessageTemplateFormComponent implements OnInit {
    public dialogRef = inject<MatDialogRef<MessageTemplateFormComponent>>(MatDialogRef);
    public data = inject<MensajePlantillaCorreoDTO | null>(MAT_DIALOG_DATA);

    private service = inject(MessageTemplateService);

    template: MensajePlantillaCorreoDTO = new MensajePlantillaCorreoDTO();
    cargando = false;

    ngOnInit(): void {
        if (this.data) {
            this.template = { ...this.data };
        } else {
            this.template = new MensajePlantillaCorreoDTO();
            this.template.estado = 'A';
        }
    }

    onSubmit(): void {
        this.cargando = true;

        const request$ = this.template.llaveTabla
            ? this.service.updateTemplate(this.template)
            : this.service.createTemplate(this.template);

        request$.subscribe({
            next: (result) => {
                this.cargando = false;
                Swal.fire('Éxito', 'Plantilla guardada correctamente', 'success');
                this.dialogRef.close(result);
            },
            error: (err) => {
                this.cargando = false;
                Swal.fire('Error', 'No se pudo guardar la plantilla', 'error');
            }
        });
    }
}