import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { DocumentoPlantillaDTO, DocumentoPlantillaCaracteristicaDTO, ProcesoTransicionDTO, ReporteBaseDTO } from 'app/document/document.types';
import { DocumentoPlantillaTipoLabel } from 'app/document/form/form.enum';
import { DocumentTemplateService } from 'app/configuration/configuracion.api';
import { PropertyPanelComponent } from '../../shared/property-panel/property-panel.component';
import { ProcessSelectorComponent } from '../../shared/process-selector/process-selector.component';
import { ImageUploaderComponent } from 'app/upload/components/image-uploader/image-uploader.component';
import { DocumentTemplateFieldListComponent } from '../document-template-fields/document-template-field-list/document-template-field-list.component';
import { DocumentTemplateReportListComponent } from '../document-template-reports/document-template-report-list/document-template-report-list.component';
import { forkJoin } from 'rxjs';
import { IdDialogData } from '../../shared/dialog-data';

@Component({
    selector: 'app-document-template-form',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatTabsModule, MatIconModule, MatTableModule, ProcessSelectorComponent, ImageUploaderComponent, DocumentTemplateFieldListComponent, DocumentTemplateReportListComponent],
    templateUrl: './document-template-form.component.html',
})
export class DocumentTemplateFormComponent implements OnInit {
    private notificationCenter = inject(NotificationCenterService);
    public dialogRef = inject<MatDialogRef<DocumentTemplateFormComponent>>(MatDialogRef);
    public data = inject<IdDialogData | null>(MAT_DIALOG_DATA);

    private service = inject(DocumentTemplateService);
    private dialog = inject(MatDialog);
    private cdr = inject(ChangeDetectorRef);

    template: DocumentoPlantillaDTO = new DocumentoPlantillaDTO();
    cargando = false;
    activeTab = signal(0);
    transiciones = signal<ProcesoTransicionDTO[]>([]);
    cargandoTransiciones = signal(false);
    transitionColumns = ['nombre', 'proceso', 'origen', 'destino', 'estado'];

    ngOnInit(): void {
        this.template = new DocumentoPlantillaDTO();
        this.template.estado = 'A';
        this.template.caracteristicas = [];
        this.template.reportes = [];

        if (this.data?.id) {
            this.loadTemplateFromServer(this.data.id);
        }
    }

    private loadTemplateFromServer(templateId: string): void {
        this.cargando = true;
        this.loadTransiciones(templateId);
        forkJoin({
            plantilla: this.service.getTemplateById(templateId),
            caracteristicas: this.service.getTemplateFields(templateId),
            reportes: this.service.getTemplateReports(templateId),
        }).subscribe({
            next: ({ plantilla, caracteristicas, reportes }) => {
                this.cargando = false;
                if (!plantilla) {
                    this.notificationCenter.fire({
                        title: 'Plantilla no encontrada',
                        html: 'No existe una plantilla con la clave solicitada.',
                        confirmButtonText: 'Cerrar',
                    });
                    this.dialogRef.close();
                    return;
                }
                this.template = plantilla;
                this.template.caracteristicas = caracteristicas || [];
                this.template.reportes = reportes || [];
                this.cdr.markForCheck();
            },
            error: () => {
                this.cargando = false;
                this.notificationCenter.error('Error', 'No se pudo cargar la plantilla.');
                this.dialogRef.close();
            }
        });
    }

    private loadTransiciones(templateId: string): void {
        this.cargandoTransiciones.set(true);
        this.service.getTemplateTransitions(templateId, null).subscribe({
            next: (res) => { this.transiciones.set(res ?? []); this.cargandoTransiciones.set(false); },
            error: () => { this.transiciones.set([]); this.cargandoTransiciones.set(false); }
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
                this.notificationCenter.fire('Éxito', 'Plantilla de documento guardada correctamente', 'success');
                this.dialogRef.close(result);
            },
            error: () => {
                this.cargando = false;
            }
        });
    }
}
