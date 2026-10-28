import { Component, Input, Output, EventEmitter, OnInit, inject, signal, computed } from '@angular/core';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReporteBaseDTO } from 'app/document/document.types';
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
    mostrarInactivos = signal(false);

    activos = computed(() => this.reports().filter((r) => r.estado === 'A'));
    inactivos = computed(() => this.reports().filter((r) => r.estado !== 'A'));
    totalInactivos = computed(() => this.inactivos().length);
    visibles = computed(() => this.mostrarInactivos() ? [...this.activos(), ...this.inactivos()] : this.activos());

    displayedColumns = ['codigo', 'nombre',  'estado', 'acciones'];

    ngOnInit(): void {
        if (this.templateKey) {
            this.loadReports();
        }
    }

    loadReports(): void {
        this.loading.set(true);
        this.service.getTemplateReports(this.templateKey, null).subscribe({
            next: (res) => { this.reports.set(res ?? []); this.loading.set(false); },
            error: () => this.loading.set(false)
        });
    }

    toggleInactivos(): void {
        this.mostrarInactivos.update((value) => !value);
    }

    openReportForm(report?: ReporteBaseDTO): void {
        const dialogRef = this.dialog.open(DocumentTemplateReportFormComponent, {
            width: '700px', maxWidth: '90vw', disableClose: true,
            data: { id: report?.llaveTabla, templateId: this.templateKey }
        });
        dialogRef.afterClosed().subscribe((result: ReporteBaseDTO) => {
            if (result) {
                this.reportSaved.emit(result);
                this.loadReports();
            }
        });
    }

    inactivarReporte(report: ReporteBaseDTO): void {
        this.notificationCenter.fire({
            title: '¿Inactivar reporte?',
            text: `El reporte "${report.nombre}" dejará de estar disponible en la plantilla.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, inactivar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.service.inactivateReport(report).subscribe({
                    next: () => {
                        this.notificationCenter.fire('Éxito', 'Reporte inactivado correctamente', 'success');
                        this.loadReports();
                    }
                });
            }
        });
    }

    reactivarReporte(report: ReporteBaseDTO): void {
        this.notificationCenter.fire({
            title: '¿Reactivar reporte?',
            text: `El reporte "${report.nombre}" volverá a estar disponible en la plantilla.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, reactivar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.service.activateReport(report).subscribe({
                    next: () => {
                        this.notificationCenter.fire('Éxito', 'Reporte reactivado correctamente', 'success');
                        this.loadReports();
                    }
                });
            }
        });
    }
}
