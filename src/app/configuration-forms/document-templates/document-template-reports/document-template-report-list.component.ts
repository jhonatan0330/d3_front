import { Component, Input, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ReporteBaseDTO, ReporteBaseFilterDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { DocumentTemplateService } from '../document-template.service';
import { DocumentTemplateReportFormComponent } from './document-template-report-form.component';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-document-template-report-list',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule, MatButtonModule, MatTableModule, MatPaginatorModule, MatInputModule, MatFormFieldModule, MatSelectModule],
    template: `
    <div class="flex flex-col h-full">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold">Reportes de la Plantilla</h3>
        <button type="button" class="btn-flat-primary" (click)="openReportForm()"><mat-icon>add</mat-icon> Agregar Reporte</button>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-12"><mat-spinner diameter="40"></mat-spinner></div>
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
              <ng-container matColumnDef="codigo"><th mat-header-cell class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Código</th><td mat-cell class="px-4 py-3 font-mono text-sm">{{ element.codigo }}</td></ng-container>
              <ng-container matColumnDef="nombre"><th mat-header-cell class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Nombre</th><td mat-cell class="px-4 py-3 font-medium">{{ element.nombre }}</td></ng-container>
              <ng-container matColumnDef="descripcion"><th mat-header-cell class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Descripción</th><td mat-cell class="px-4 py-3 text-sm truncate max-w-xs">{{ element.descripcion }}</td></ng-container>
              <ng-container matColumnDef="version"><th mat-header-cell class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Versión</th><td mat-cell class="px-4 py-3">{{ element.version }}</td></ng-container>
              <ng-container matColumnDef="servidor"><th mat-header-cell class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Servidor</th><td mat-cell class="px-4 py-3">{{ element.servidor }}</td></ng-container>
              <ng-container matColumnDef="publico"><th mat-header-cell class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Público</th><td mat-cell class="px-4 py-3"><span class="badge" [class.badge-success]="element.publico" [class.badge-secondary]="!element.publico">{{ element.publico ? 'Sí' : 'No' }}</span></td></ng-container>
              <ng-container matColumnDef="soloExistente"><th mat-header-cell class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Solo Existente</th><td mat-cell class="px-4 py-3"><span class="badge" [class.badge-info]="element.soloExistente" [class.badge-secondary]="!element.soloExistente">{{ element.soloExistente ? 'Sí' : 'No' }}</span></td></ng-container>
              <ng-container matColumnDef="estado"><th mat-header-cell class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Estado</th><td mat-cell class="px-4 py-3"><span class="badge" [class.badge-success]="element.estado === 'A'" [class.badge-secondary]="element.estado === 'I'">{{ element.estado === 'A' ? 'Activo' : 'Inactivo' }}</span></td></ng-container>
              <ng-container matColumnDef="acciones"><th mat-header-cell class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Acciones</th><td mat-cell class="px-4 py-3"><div class="flex items-center justify-end gap-1"><button type="button" class="btn-icon btn-flat-primary" (click)="openReportForm(element)" aria-label="Editar"><mat-icon>edit</mat-icon></button><button type="button" class="btn-icon btn-flat-accent" (click)="toggleStatus(element)" aria-label="{{ element.estado === 'A' ? 'Inactivar' : 'Activar' }}"><mat-icon>{{ element.estado === 'A' ? 'block' : 'check_circle' }}</mat-icon></button></div></td></ng-container>
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr><tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>
        </div>
      }
    </div>
  `,
    styles: [`
    .btn-flat-primary { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; border-radius: 4px; font-weight: 500; background: #3f51b5; color: white; border: none; }
    .btn-flat-primary:hover { background: #303f9f; }
    .btn-icon { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 50%; border: none; background: transparent; color: #666; cursor: pointer; }
    .btn-icon:hover { background: #f5f5f5; color: #333; }
    .btn-flat-accent { background: #f44336; color: white; }
    .btn-flat-accent:hover { background: #d32f2f; }
    .badge { padding: 0.125rem 0.5rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 500; }
    .badge-success { background: #e8f5e9; color: #2e7d32; }
    .badge-secondary { background: #f5f5f5; color: #757575; }
    .badge-info { background: #e3f2fd; color: #1565c0; }
    :host ::ng-deep .mat-form-field { width: 100%; }
    :host ::ng-deep .mat-column-acciones { width: 100px; text-align: right; }
    :host ::ng-deep .mat-column-publico, :host ::ng-deep .mat-column-soloExistente { width: 100px; text-align: center; }
  `]
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