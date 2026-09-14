import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { DocumentoPlantillaDTO, DocumentoPlantillaCaracteristicaDTO, ReporteBaseDTO } from 'app/document/document.types';
import { DocumentoPlantillaTipoLabel } from 'app/document/form/form.enum';
import { DocumentTemplateService } from '../configuracion.api';
import { PropertyPanelComponent } from '../shared/property-panel.component';
import { ProcessSelectorComponent } from '../shared/process-selector.component';
import { ImageUploaderComponent } from '../../upload/image-uploader/image-uploader.component';
import { DocumentTemplateFieldListComponent } from './document-template-fields/document-template-field-list.component';
import { DocumentTemplateReportListComponent } from './document-template-reports/document-template-report-list.component';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-document-template-form',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatTabsModule, MatIconModule, ProcessSelectorComponent, ImageUploaderComponent, DocumentTemplateFieldListComponent, DocumentTemplateReportListComponent],
    template: `
    <div class="bg-white dark:bg-gray-900 rounded-xl shadow-lg max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col">
      <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-xl font-bold">{{ data?.llaveTabla ? 'Editar Plantilla' : 'Nueva Plantilla' }}</h2>
        <button type="button" class="btn-icon" (click)="dialogRef.close()"><mat-icon>close</mat-icon></button>
      </div>

      <form #form="ngForm" (ngSubmit)="onSubmit()">
        <mat-tab-group class="flex-1 overflow-hidden" [selectedIndex]="activeTab()">
          <!-- Tab General -->
          <mat-tab label="General">
            <div class="p-4 overflow-y-auto space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="sm:col-span-2">
                  <label class="block text-sm font-semibold mb-1">Nombre *</label>
                  <input type="text" [(ngModel)]="template.nombre" name="nombre" required class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label class="block text-sm font-semibold mb-1">Código *</label>
                  <input type="text" [(ngModel)]="template.codigo" name="codigo" required class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label class="block text-sm font-semibold mb-1">Consecutivo</label>
                  <input type="text" [(ngModel)]="template.consecutivo" name="consecutivo" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <app-process-selector [(ngModel)]="template.proceso" name="proceso"></app-process-selector>
                </div>
                <div>
                  <label class="block text-sm font-semibold mb-1">Imagen</label>
                  <app-image-uploader [(value)]="template.imagen"></app-image-uploader>
                </div>
                <div>
                  <label class="block text-sm font-semibold mb-1">Tipo</label>
                  <div class="px-3 py-2 rounded bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm">{{ tipoLabel(template.tipo) }}</div>
                </div>
                <div>
                  <label class="block text-sm font-semibold mb-1">Padre</label>
                  <div class="px-3 py-2 rounded bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm">{{ template.padre || '-' }}</div>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Tab Campos -->
          <mat-tab label="Campos ({{ template.caracteristicas.length || 0 }})">
            <div class="p-4 h-full">
              <app-document-template-field-list
                [templateKey]="template.llaveTabla"
                [template]="template"
                (fieldSaved)="onFieldSaved($event)">
              </app-document-template-field-list>
            </div>
          </mat-tab>

          <!-- Tab Reportes -->
          <mat-tab label="Reportes ({{ template.reportes.length || 0 }})">
            <div class="p-4 h-full">
              <app-document-template-report-list
                [templateKey]="template.llaveTabla"
                (reportSaved)="onReportSaved($event)">
              </app-document-template-report-list>
            </div>
          </mat-tab>
        </mat-tab-group>

        <div class="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <button type="button" class="btn-flat" (click)="openPropiedades()" [disabled]="!template.llaveTabla"><mat-icon>tune</mat-icon> Propiedades</button>
          <button type="button" class="btn-flat" (click)="dialogRef.close()">Cancelar</button>
          <button type="submit" class="btn-flat-primary" [disabled]="cargando || !form.valid">{{ cargando ? 'Guardando...' : (data?.llaveTabla ? 'Actualizar' : 'Crear') }}</button>
        </div>
      </form>
    </div>
  `,
    styles: []
})
export class DocumentTemplateFormComponent implements OnInit {
    public dialogRef = inject<MatDialogRef<DocumentTemplateFormComponent>>(MatDialogRef);
    public data = inject<DocumentoPlantillaDTO | null>(MAT_DIALOG_DATA);

    private service = inject(DocumentTemplateService);
    private dialog = inject(MatDialog);

    template: DocumentoPlantillaDTO = new DocumentoPlantillaDTO();
    cargando = false;
    activeTab = signal(0);

    ngOnInit(): void {
        if (this.data) {
            this.template = { ...this.data };
            if (!this.template.caracteristicas) this.template.caracteristicas = [];
            if (!this.template.reportes) this.template.reportes = [];
        } else {
            this.template = new DocumentoPlantillaDTO();
            this.template.estado = 'A';
            this.template.caracteristicas = [];
            this.template.reportes = [];
        }
    }

    openPropiedades(): void {
        if (!this.template.llaveTabla) return;
        this.dialog.open(PropertyPanelComponent, {
            width: '800px', maxWidth: '95vw', maxHeight: '90vh', disableClose: true,
            data: { campoKey: this.template.llaveTabla, tipoOrigen: 'L', titulo: this.template.nombre }
        });
    }

    tipoLabel(tipo: string): string {
        return DocumentoPlantillaTipoLabel[tipo] || tipo || '-';
    }

    onFieldSaved(field: DocumentoPlantillaCaracteristicaDTO): void {
        if (!this.template.caracteristicas) this.template.caracteristicas = [];
        const idx = this.template.caracteristicas.findIndex(f => f.llaveTabla === field.llaveTabla);
        if (idx >= 0) this.template.caracteristicas[idx] = field;
        else this.template.caracteristicas.push(field);
    }

    onReportSaved(report: ReporteBaseDTO): void {
        if (!this.template.reportes) this.template.reportes = [];
        const idx = this.template.reportes.findIndex(r => r.llaveTabla === report.llaveTabla);
        if (idx >= 0) this.template.reportes[idx] = report;
        else this.template.reportes.push(report);
    }

    onSubmit(): void {
        this.cargando = true;

        const request$ = this.template.llaveTabla
            ? this.service.updateTemplate(this.template)
            : this.service.createTemplate(this.template);

        request$.subscribe({
            next: (result) => {
                this.cargando = false;
                Swal.fire('Éxito', 'Plantilla de documento guardada correctamente', 'success');
                this.dialogRef.close(result);
            },
            error: (err) => {
                this.cargando = false;
                Swal.fire('Error', 'No se pudo guardar la plantilla de documento', 'error');
            }
        });
    }
}