import { Component, OnInit, inject, signal } from '@angular/core';
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
import { DocumentoPlantillaDTO, DocumentoPlantillaFilterDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { DocumentTemplateService } from './document-template.service';
import { DocumentTemplateFormComponent } from './document-template-form.component';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-document-template-list',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule, MatButtonModule, MatTableModule, MatPaginatorModule, MatInputModule, MatFormFieldModule, MatSelectModule],
    template: `
    <div class="p-4 sm:p-6 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Plantillas de Documento</h1>
        <button type="button" class="btn-flat-primary" (click)="openForm()"><mat-icon>add</mat-icon> Nueva Plantilla</button>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <mat-form-field appearance="outline" class="w-full"><mat-label>Nombre</mat-label><input matInput [(ngModel)]="filter.nombre" (ngModelChange)="onFilterChange()" placeholder="Filtrar por nombre" /></mat-form-field>
          <mat-form-field appearance="outline" class="w-full"><mat-label>Código</mat-label><input matInput [(ngModel)]="filter.codigo" (ngModelChange)="onFilterChange()" placeholder="Filtrar por código" /></mat-form-field>
          <mat-form-field appearance="outline" class="w-full"><mat-label>Proceso</mat-label><input matInput [(ngModel)]="filter.proceso" (ngModelChange)="onFilterChange()" placeholder="Filtrar por proceso" /></mat-form-field>
          <mat-form-field appearance="outline" class="w-full"><mat-label>Estado</mat-label><mat-select [(ngModel)]="filter.estado" (ngModelChange)="onFilterChange()"><mat-option value="A">Activo</mat-option><mat-option value="I">Inactivo</mat-option><mat-option value="">Todos</mat-option></mat-select></mat-form-field>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        @if (loading()) { <div class="flex justify-center py-12"><mat-spinner diameter="40"></mat-spinner></div> } @else {
          <div class="overflow-x-auto">
            <table mat-table [dataSource]="data()" class="w-full">
              <ng-container matColumnDef="codigo"><th mat-header-cell class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Código</th><td mat-cell class="px-4 py-3 font-mono text-sm">{{ element.codigo }}</td></ng-container>
              <ng-container matColumnDef="nombre"><th mat-header-cell class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Nombre</th><td mat-cell class="px-4 py-3 font-medium">{{ element.nombre }}</td></ng-container>
              <ng-container matColumnDef="objetivo"><th mat-header-cell class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Objetivo</th><td mat-cell class="px-4 py-3 text-sm truncate max-w-xs">{{ element.objetivo }}</td></ng-container>
              <ng-container matColumnDef="consecutivo"><th mat-header-cell class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Consecutivo</th><td mat-cell class="px-4 py-3">{{ element.consecutivo }}</td></ng-container>
              <ng-container matColumnDef="proceso"><th mat-header-cell class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Proceso</th><td mat-cell class="px-4 py-3">{{ element.proceso }}</td></ng-container>
              <ng-container matColumnDef="color"><th mat-header-cell class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Color</th><td mat-cell class="px-4 py-3"><div class="w-6 h-6 rounded border" [style.background-color]="element.color"></div></td></ng-container>
              <ng-container matColumnDef="camposCount"><th mat-header-cell class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Campos</th><td mat-cell class="px-4 py-3">{{ element.caracteristicas?.length || 0 }}</td></ng-container>
              <ng-container matColumnDef="reportesCount"><th mat-header-cell class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Reportes</th><td mat-cell class="px-4 py-3">{{ element.reportes?.length || 0 }}</td></ng-container>
              <ng-container matColumnDef="estado"><th mat-header-cell class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Estado</th><td mat-cell class="px-4 py-3"><span class="badge" [class.badge-success]="element.estado === 'A'" [class.badge-secondary]="element.estado === 'I'">{{ element.estado === 'A' ? 'Activo' : 'Inactivo' }}</span></td></ng-container>
              <ng-container matColumnDef="acciones"><th mat-header-cell class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Acciones</th><td mat-cell class="px-4 py-3"><div class="flex items-center justify-end gap-1"><button type="button" class="btn-icon btn-flat-primary" (click)="openForm(element)" aria-label="Editar"><mat-icon>edit</mat-icon></button><button type="button" class="btn-icon" (click)="duplicateTemplate(element)" aria-label="Duplicar" title="Duplicar" matTooltip="Duplicar"><mat-icon>content_copy</mat-icon></button><button type="button" class="btn-icon btn-flat-accent" (click)="toggleStatus(element)" aria-label="{{ element.estado === 'A' ? 'Inactivar' : 'Activar' }}"><mat-icon>{{ element.estado === 'A' ? 'block' : 'check_circle' }}</mat-icon></button></div></td></ng-container>
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr><tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>
          <mat-paginator [length]="totalItems()" [pageSize]="pageSize()" [pageSizeOptions]="[10, 25, 50, 100]" (page)="onPageChange($event)" class="px-4 py-2 border-t border-gray-200 dark:border-gray-700"></mat-paginator>
        }
        @if (!loading() && data().length === 0) { <div class="text-center py-12 text-gray-500 dark:text-gray-400">No hay plantillas registradas</div> }
      </div>
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
    :host ::ng-deep .mat-form-field { width: 100%; }
    :host ::ng-deep .mat-column-acciones { width: 140px; text-align: right; }
    :host ::ng-deep .mat-column-color { width: 60px; text-align: center; }
    :host ::ng-deep .mat-column-camposCount, :host ::ng-deep .mat-column-reportesCount { width: 80px; text-align: center; }
  `]
})
export class DocumentTemplateListComponent implements OnInit {
    private service = inject(DocumentTemplateService);
    private dialog = inject(MatDialog);

    loading = signal(false);
    data = signal<DocumentoPlantillaDTO[]>([]);
    totalItems = signal(0);
    pageSize = signal(25);
    currentPage = signal(0);

    filter = signal<DocumentoPlantillaFilterDTO>({
        estado: 'A',
        nombre: '',
        consecutivo: '',
        imagen: '',
        color: '',
        codigo: '',
        server: '',
        proceso: '',
        paginacionRegistroInicial: 0,
        paginacionRegistroFinal: 25
    });

    displayedColumns = ['codigo', 'nombre', 'objetivo', 'consecutivo', 'proceso', 'color', 'camposCount', 'reportesCount', 'estado', 'acciones'];

    ngOnInit(): void { this.loadData(); }

    loadData(): void {
        this.loading.set(true);
        const f = this.filter();
        f.paginacionRegistroInicial = this.currentPage() * this.pageSize();
        f.paginacionRegistroFinal = f.paginacionRegistroInicial + this.pageSize();
        this.service.getTemplates(f).subscribe({ next: (res) => { this.data.set(res); this.totalItems.set(res.length); this.loading.set(false); }, error: () => this.loading.set(false) });
    }

    onFilterChange(): void { this.currentPage.set(0); this.loadData(); }
    onPageChange(event: PageEvent): void { this.currentPage.set(event.pageIndex); this.pageSize.set(event.pageSize); this.loadData(); }

    openForm(item?: DocumentoPlantillaDTO): void {
        const dialogRef = this.dialog.open(DocumentTemplateFormComponent, { width: '900px', maxWidth: '95vw', maxHeight: '95vh', data: item ? { ...item } : null });
        dialogRef.afterClosed().subscribe((result: DocumentoPlantillaDTO) => { if (result) this.loadData(); });
    }

    duplicateTemplate(item: DocumentoPlantillaDTO): void {
        Swal.fire({ title: '¿Duplicar plantilla?', text: 'Se creará una copia con los mismos campos y reportes.', icon: 'question', showCancelButton: true, confirmButtonText: 'Sí, duplicar', cancelButtonText: 'Cancelar' })
            .then((result) => { if (result.isConfirmed) { this.service.duplicateTemplate(item.llaveTabla).subscribe({ next: () => { Swal.fire('Duplicado', 'Plantilla duplicada correctamente', 'success'); this.loadData(); }, error: () => Swal.fire('Error', 'No se pudo duplicar la plantilla', 'error') }); }});
    }

    toggleStatus(item: DocumentoPlantillaDTO): void {
        const newEstado = item.estado === 'A' ? 'I' : 'A';
        const action = newEstado === 'A' ? 'activar' : 'inactivar';
        Swal.fire({ title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} plantilla?`, icon: 'question', showCancelButton: true, confirmButtonText: 'Sí', cancelButtonText: 'Cancelar' })
            .then((result) => { if (result.isConfirmed) { const updated = { ...item, estado: newEstado }; this.service.inactivateTemplate(updated).subscribe({ next: () => { Swal.fire('Éxito', `Plantilla ${action}da correctamente`, 'success'); this.loadData(); }, error: () => Swal.fire('Error', `No se pudo ${action} la plantilla`, 'error') }); }});
    }
}