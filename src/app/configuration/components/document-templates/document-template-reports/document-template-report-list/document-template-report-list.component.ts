import { Component, Input, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReporteBaseDTO, ReporteBaseFilterDTO } from 'app/document/document.types';
import { DocumentTemplateService } from 'app/configuration/configuracion.api';
import { DocumentTemplateReportFormComponent } from '../document-template-report-form/document-template-report-form.component';

@Component({
    selector: 'app-document-template-report-list',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule, MatTableModule, MatInputModule, MatFormFieldModule],
    templateUrl: './document-template-report-list.component.html',
})
export class DocumentTemplateReportListComponent implements OnInit {
    private notificationCenter = inject(NotificationCenterService);
    private service = inject(DocumentTemplateService);
    private dialog = inject(MatDialog);

    @Input() templateKey!: string;
    @Output() reportSaved = new EventEmitter<ReporteBaseDTO>();

    reports = signal<ReporteBaseDTO[]>([]);
    loading = signal(false);

    displayedColumns = ['codigo', 'nombre', 'descripcion', 'version', 'servidor', 'publico', 'soloExistente', 'estado', 'acciones'];

    ngOnInit(): void {
        if (this.templateKey) {
            this.loadReports();
        }
    }

    loadReports(): void {
        this.loading.set(true);
        this.service.getTemplateReports(this.templateKey).subscribe({
            next: (res) => { this.reports.set(res); this.loading.set(false); },
            error: () => this.loading.set(false)
        });
    }

    openReportForm(report?: ReporteBaseDTO): void {
        const dialogRef = this.dialog.open(DocumentTemplateReportFormComponent, {
            width: '700px', maxWidth: '90vw', disableClose: true,
            data: { report: report ? { ...report } : null, templateKey: this.templateKey }
        });
        dialogRef.afterClosed().subscribe((result: ReporteBaseDTO) => {
            if (result) {
                this.reportSaved.emit(result);
                this.loadReports();
            }
        });
    }

    toggleStatus(item: ReporteBaseDTO): void {
        const newEstado = item.estado === 'A' ? 'I' : 'A';
        const action = newEstado === 'A' ? 'activar' : 'inactivar';
        this.notificationCenter.fire({ title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} reporte?`, icon: 'question', showCancelButton: true, confirmButtonText: 'Sí', cancelButtonText: 'Cancelar' })
            .then((result) => { if (result.isConfirmed) { const updated = { ...item, estado: newEstado }; this.service.inactivateReport(updated).subscribe({ next: () => { this.notificationCenter.fire('Éxito', `Reporte ${action}do correctamente`, 'success'); this.loadReports(); }, error: () => this.notificationCenter.fire('Error', `No se pudo ${action} el reporte`, 'error') }); }});
    }
}
