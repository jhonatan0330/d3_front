import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ReporteBaseDTO } from 'app/document/document.types';
import { DocumentTemplateService } from 'app/configuration/configuracion.api';
import { PropertyPanelComponent } from '../../../shared/property-panel/property-panel.component';
import { MatIconModule } from '@angular/material/icon';
import { TemplateChildDialogData } from '../../../shared/dialog-data';

@Component({
    selector: 'app-document-template-report-form',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule],
    templateUrl: './document-template-report-form.component.html',
})
export class DocumentTemplateReportFormComponent implements OnInit {
    private notificationCenter = inject(NotificationCenterService);
    public dialogRef = inject<MatDialogRef<DocumentTemplateReportFormComponent>>(MatDialogRef);
    public data = inject<TemplateChildDialogData>(MAT_DIALOG_DATA);

    private service = inject(DocumentTemplateService);
    private dialog = inject(MatDialog);
    private cdr = inject(ChangeDetectorRef);

    report: ReporteBaseDTO = new ReporteBaseDTO();
    cargando = false;

    ngOnInit(): void {
        if (this.data?.id) {
            this.loadReport(this.data.id);
            return;
        }
        this.report = new ReporteBaseDTO();
        this.report.estado = 'A';
        this.report.plantilla = this.data.templateId;
        this.report.version = 1;
        this.report.soloExistente = false;
        this.report.publico = false;
        this.report.variables = '';
    }

    private loadReport(id: string): void {
        this.cargando = true;
        this.service.getReportById(id).subscribe({
            next: (result) => {
                this.cargando = false;
                if (!result) {
                    this.notificationCenter.error('Reporte no encontrado', 'No existe un reporte con la clave solicitada.');
                    this.dialogRef.close();
                    return;
                }
                this.report = { ...result };
                this.cdr.markForCheck();
            },
            error: () => {
                this.cargando = false;
                this.notificationCenter.error('Error', 'No se pudo cargar el reporte.');
                this.dialogRef.close();
            }
        });
    }

    openPropiedades(): void {
        if (!this.report.llaveTabla) return;
        this.dialog.open(PropertyPanelComponent, {
            width: '800px', maxWidth: '95vw', maxHeight: '90vh', disableClose: true,
            data: { campoKey: this.report.llaveTabla, tipoOrigen: 'E', titulo: this.report.nombre }
        });
    }

    onSubmit(): void {
        this.cargando = true;

        const request$ = this.report.llaveTabla
            ? this.service.updateReport(this.report)
            : this.service.createReport(this.report);

        request$.subscribe({
            next: (result) => {
                this.cargando = false;
                this.notificationCenter.fire('Éxito', 'Reporte guardado correctamente', 'success');
                this.dialogRef.close(result);
            },
            error: () => {
                this.cargando = false;
            }
        });
    }
}
