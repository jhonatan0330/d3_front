import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ReporteBaseDTO } from 'app/document/document.types';
import { DocumentTemplateService } from 'app/configuration/configuracion.api';
import { PropertyPanelComponent } from '../../../shared/property-panel/property-panel.component';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';

interface ReportFormData {
    report?: ReporteBaseDTO;
    templateKey: string;
}

@Component({
    selector: 'app-document-template-report-form',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule],
    templateUrl: './document-template-report-form.component.html',
})
export class DocumentTemplateReportFormComponent implements OnInit {
    public dialogRef = inject<MatDialogRef<DocumentTemplateReportFormComponent>>(MatDialogRef);
    public data = inject<ReportFormData>(MAT_DIALOG_DATA);

    private service = inject(DocumentTemplateService);
    private dialog = inject(MatDialog);

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
        }
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
                Swal.fire('Éxito', 'Reporte guardado correctamente', 'success');
                this.dialogRef.close(result);
            },
            error: (err) => {
                this.cargando = false;
                Swal.fire('Error', 'No se pudo guardar el reporte', 'error');
            }
        });
    }
}