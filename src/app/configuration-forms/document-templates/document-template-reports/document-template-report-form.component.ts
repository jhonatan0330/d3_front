import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ReporteBaseDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { PropertyFieldComponent } from '../../shared/property-field.component';
import Swal from 'sweetalert2';

interface ReportFormData {
    report?: ReporteBaseDTO;
    templateKey: string;
}

@Component({
    selector: 'app-document-template-report-form',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, PropertyFieldComponent],
    template: `
    <div class="max-w-2xl w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
      <h2 class="text-xl font-bold border-b border-gray-200 dark:border-gray-700 pb-2">
        {{ data.report?.llaveTabla ? 'Editar Reporte' : 'Nuevo Reporte' }}
      </h2>

      <form #form="ngForm" (ngSubmit)="onSubmit()">
        <div class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold mb-1">Código *</label>
              <input type="text" [(ngModel)]="report.codigo" name="codigo" required class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1">Nombre *</label>
              <input type="text" [(ngModel)]="report.nombre" name="nombre" required class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold mb-1">Descripción</label>
            <textarea [(ngModel)]="report.descripcion" name="descripcion" rows="3" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold mb-1">Versión</label>
              <input type="number" [(ngModel)]="report.version" name="version" min="1" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1">Servidor</label>
              <input type="text" [(ngModel)]="report.servidor" name="servidor" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold mb-1">Servidor URL</label>
              <input type="text" [(ngModel)]="report.servidorUrl" name="servidorUrl" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1">Múltiples IDs</label>
              <input type="text" [(ngModel)]="report.multiplesId" name="multiplesId" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="IDs separados por coma" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold mb-1">Variables (JSON)</label>
              <textarea [(ngModel)]="report.variables" name="variables" rows="3" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm" placeholder='{}'></textarea>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" [(ngModel)]="report.soloExistente" name="soloExistente" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
              <span class="text-sm">Solo Existente</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" [(ngModel)]="report.publico" name="publico" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
              <span class="text-sm">Público</span>
            </label>
          </div>

          <app-property-field
            [propiedades]="report.propiedades || []"
            [tipoOrigen]="'R'"
            [campoKey]="report.llaveTabla || ''"
            (propiedadesChange)="onPropiedadesChange($event)">
          </app-property-field>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button type="button" class="btn-flat" (click)="dialogRef.close()">Cancelar</button>
          <button type="submit" class="btn-flat-primary" [disabled]="cargando || !form.valid">{{ cargando ? 'Guardando...' : (data.report?.llaveTabla ? 'Actualizar' : 'Crear') }}</button>
        </div>
      </form>
    </div>
  `,
    styles: []
})
export class DocumentTemplateReportFormComponent implements OnInit {
    public dialogRef = inject<MatDialogRef<DocumentTemplateReportFormComponent>>(MatDialogRef);
    public data = inject<ReportFormData>(MAT_DIALOG_DATA);

    report: ReporteBaseDTO = new ReporteBaseDTO();
    cargando = false;

    ngOnInit(): void {
        if (this.data.report) {
            this.report = { ...this.data.report };
        } else {
            this.report = new ReporteBaseDTO();
            this.report.estado = 'A';
            this.report.plantilla = this.data.templateKey;
            this.report.version = 1;
            this.report.soloExistente = false;
            this.report.publico = false;
            this.report.variables = '{}';
            this.report.propiedades = [];
        }
    }

    onPropiedadesChange(props: any[]): void {
        this.report.propiedades = props;
    }

    onSubmit(): void {
        this.cargando = true;
        this.dialogRef.close(this.report);
    }
}