import { Component, Input, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReporteBaseDTO, ReporteBaseFilterDTO } from 'app/document/model/sw42.domain';
import { DocumentTemplateService } from '../../configuracion.api';
import { DocumentTemplateReportFormComponent } from './document-template-report-form.component';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-document-template-report-list',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule, MatTableModule, MatPaginatorModule, MatInputModule, MatFormFieldModule],
    template: `
    <div class="flex flex-col h-full">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold">Reportes de la Plantilla</h3>
        <button type="button" class="btn-flat-primary" (click)="openReportForm()"><mat-icon>add</mat-icon> Agregar Reporte</button>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-12"><div class="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden"><div class="h-full bg-primary rounded animate-pulse" style="width: 40%;"></div></div></div>
      } @else if (reports().length === 0) {
        <div class="flex-1 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
          <mat-icon class="text-6xl mb-4">assessment</mat-icon>
          <p class="text-lg">No hay reportes configurados</p>
          <button type="button" class="btn-flat-primary mt-4" (click)="openReportForm()"><mat-icon>add</mat-icon> Crear primer reporte</button>
        </div>
      } @else {
        <div class="flex-1 overflow-y-auto">
          <div class="overflow-x-auto">
            <table mat-table [dataSource]="reports()" class="w-full">
              <ng-container matColumnDef="codigo"><th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Código</th><td mat-cell *matCellDef="let element" class="px-4 py-3 font-mono text-sm">{{ element.codigo }}</td></ng-container>
              <ng-container matColumnDef="nombre"><th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Nombre</th><td mat-cell *matCellDef="let element" class="px-4 py-3 font-medium">{{ element.nombre }}</td></ng-container>
              <ng-container matColumnDef="descripcion"><th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Descripción</th><td mat-cell *matCellDef="let element" class="px-4 py-3 text-sm truncate max-w-xs">{{ element.descripcion }}</td></ng-container>
              <ng-container matColumnDef="version"><th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Versión</th><td mat-cell *matCellDef="let element" class="px-4 py-3">{{ element.version }}</td></ng-container>
              <ng-container matColumnDef="servidor"><th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Servidor</th><td mat-cell *matCellDef="let element" class="px-4 py-3">{{ element.servidor }}</td></ng-container>
              <ng-container matColumnDef="publico"><th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Público</th><td mat-cell *matCellDef="let element" class="px-4 py-3"><span class="badge" [class.badge-success]="element.publico" [class.badge-secondary]="!element.publico">{{ element.publico ? 'Sí' : 'No' }}</span></td></ng-container>
              <ng-container matColumnDef="soloExistente"><th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Solo Existente</th><td mat-cell *matCellDef="let element" class="px-4 py-3"><span class="badge" [class.badge-info]="element.soloExistente" [class.badge-secondary]="!element.soloExistente">{{ element.soloExistente ? 'Sí' : 'No' }}</span></td></ng-container>
              <ng-container matColumnDef="estado"><th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Estado</th><td mat-cell *matCellDef="let element" class="px-4 py-3"><span class="badge" [class.badge-success]="element.estado === 'A'" [class.badge-secondary]="element.estado === 'I'">{{ element.estado === 'A' ? 'Activo' : 'Inactivo' }}</span></td></ng-container>
              <ng-container matColumnDef="acciones"><th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Acciones</th><td mat-cell *matCellDef="let element" class="px-4 py-3"><div class="flex items-center justify-end gap-1"><button type="button" class="btn-icon btn-flat-primary" (click)="openReportForm(element)" aria-label="Editar"><mat-icon>edit</mat-icon></button><button type="button" class="btn-icon btn-flat-accent" (click)="toggleStatus(element)" aria-label="{{ element.estado === 'A' ? 'Inactivar' : 'Activar' }}"><mat-icon>{{ element.estado === 'A' ? 'block' : 'check_circle' }}</mat-icon></button></div></td></ng-container>
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr><tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>
        </div>
      }
    </div>
  `,
    styles: []
})
export class DocumentTemplateReportListComponent implements OnInit {
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
            width: '700px', maxWidth: '90vw',
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
        Swal.fire({ title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} reporte?`, icon: 'question', showCancelButton: true, confirmButtonText: 'Sí', cancelButtonText: 'Cancelar' })
            .then((result) => { if (result.isConfirmed) { const updated = { ...item, estado: newEstado }; this.service.inactivateReport(updated).subscribe({ next: () => { Swal.fire('Éxito', `Reporte ${action}do correctamente`, 'success'); this.loadReports(); }, error: () => Swal.fire('Error', `No se pudo ${action} el reporte`, 'error') }); }});
    }
}