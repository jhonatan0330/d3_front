import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { DocumentoPlantillaDTO, DocumentoPlantillaCaracteristicaDTO, ReporteBaseDTO } from 'app/document/document.types';
import { DocumentoPlantillaTipoLabel } from 'app/document/form/form.enum';
import { DocumentTemplateService } from 'app/configuration/configuracion.api';
import { PropertyPanelComponent } from '../../shared/property-panel/property-panel.component';
import { ProcessSelectorComponent } from '../../shared/process-selector/process-selector.component';
import { ImageUploaderComponent } from 'app/upload/image-uploader/image-uploader.component';
import { DocumentTemplateFieldListComponent } from '../document-template-fields/document-template-field-list/document-template-field-list.component';
import { DocumentTemplateReportListComponent } from '../document-template-reports/document-template-report-list/document-template-report-list.component';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-document-template-form',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatTabsModule, MatIconModule, ProcessSelectorComponent, ImageUploaderComponent, DocumentTemplateFieldListComponent, DocumentTemplateReportListComponent],
    templateUrl: './document-template-form.component.html',
})
export class DocumentTemplateFormComponent implements OnInit {
    public dialogRef = inject<MatDialogRef<DocumentTemplateFormComponent>>(MatDialogRef);
    public data = inject<DocumentoPlantillaDTO | { template: string } | null>(MAT_DIALOG_DATA);

    private service = inject(DocumentTemplateService);
    private dialog = inject(MatDialog);

    template: DocumentoPlantillaDTO = new DocumentoPlantillaDTO();
    cargando = false;
    activeTab = signal(0);

    ngOnInit(): void {
        this.template = new DocumentoPlantillaDTO();
        this.template.estado = 'A';
        this.template.caracteristicas = [];
        this.template.reportes = [];

        const templateId = this.getTemplateId();
        if (templateId) {
            this.loadTemplateFromServer(templateId);
            return;
        }
        if (this.data) {
            this.template = { ...(this.data as DocumentoPlantillaDTO) };
            if (!this.template.caracteristicas) this.template.caracteristicas = [];
            if (!this.template.reportes) this.template.reportes = [];
        }
    }

    private getTemplateId(): string {
        if (this.data && typeof (this.data as { template?: unknown }).template === 'string') {
            return (this.data as { template: string }).template;
        }
        return '';
    }

    private loadTemplateFromServer(templateId: string): void {
        this.cargando = true;
        forkJoin({
            plantilla: this.service.getTemplateById(templateId),
            caracteristicas: this.service.getTemplateFields(templateId),
            reportes: this.service.getTemplateReports(templateId),
        }).subscribe({
            next: ({ plantilla, caracteristicas, reportes }) => {
                this.template = plantilla;
                this.template.caracteristicas = caracteristicas || [];
                this.template.reportes = reportes || [];
                this.cargando = false;
            },
            error: () => {
                this.cargando = false;
                Swal.fire('Error', 'No se pudo consultar la plantilla de documento', 'error');
            }
        });
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