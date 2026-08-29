import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MensajePlantillaCorreoDTO, MensajePlantillaCorreoFilterDTO } from 'app/document/model/sw42.domain';
import { MessageTemplateService } from './message-template.service';
import { MessageTemplateFormComponent } from './message-template-form.component';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-message-template-list',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule, MatTableModule, MatPaginatorModule, MatInputModule, MatFormFieldModule, MatSelectModule],
    template: `
    <div class="p-4 sm:p-6 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Plantillas de Mensaje</h1>
        <button type="button" class="btn-flat-primary" (click)="openForm()"><mat-icon>add</mat-icon> Nueva Plantilla</button>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <mat-form-field appearance="outline" class="w-full"><mat-label>Nombre</mat-label><input matInput [(ngModel)]="filter.nombre" (ngModelChange)="onFilterChange()" placeholder="Filtrar por nombre" /></mat-form-field>
          <mat-form-field appearance="outline" class="w-full"><mat-label>Tipo</mat-label><mat-select [(ngModel)]="filter.tipo" (ngModelChange)="onFilterChange()"><mat-option value="">Todos</mat-option><mat-option value="EMAIL">Email</mat-option><mat-option value="SMS">SMS</mat-option><mat-option value="PUSH">Push</mat-option></mat-select></mat-form-field>
          <mat-form-field appearance="outline" class="w-full"><mat-label>Estado</mat-label><mat-select [(ngModel)]="filter.estado" (ngModelChange)="onFilterChange()"><mat-option value="A">Activo</mat-option><mat-option value="I">Inactivo</mat-option><mat-option value="">Todos</mat-option></mat-select></mat-form-field>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        @if (loading()) { <div class="flex justify-center py-12"><div class="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden"><div class="h-full bg-primary rounded animate-pulse" style="width: 40%;"></div></div></div> } @else {
          <div class="overflow-x-auto">
            <table mat-table [dataSource]="data()" class="w-full">
              <ng-container matColumnDef="nombre"><th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Nombre</th><td mat-cell *matCellDef="let element" class="px-4 py-3 font-medium">{{ element.nombre }}</td></ng-container>
              <ng-container matColumnDef="tipo"><th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Tipo</th><td mat-cell *matCellDef="let element" class="px-4 py-3"><span class="badge" [class]="getTipoBadge(element.tipo)">{{ element.tipo }}</span></td></ng-container>
              <ng-container matColumnDef="asunto"><th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Asunto</th><td mat-cell *matCellDef="let element" class="px-4 py-3 truncate max-w-xs">{{ element.asunto }}</td></ng-container>
              <ng-container matColumnDef="cuerpo"><th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Cuerpo (resumen)</th><td mat-cell *matCellDef="let element" class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 truncate max-w-md">{{ element.cuerpo }}</td></ng-container>
              <ng-container matColumnDef="adjuntos"><th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Adjuntos</th><td mat-cell *matCellDef="let element" class="px-4 py-3">{{ element.adjuntos || 'Ninguno' }}</td></ng-container>
              <ng-container matColumnDef="estado"><th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Estado</th><td mat-cell *matCellDef="let element" class="px-4 py-3"><span class="badge" [class.badge-success]="element.estado === 'A'" [class.badge-secondary]="element.estado === 'I'">{{ element.estado === 'A' ? 'Activo' : 'Inactivo' }}</span></td></ng-container>
              <ng-container matColumnDef="acciones"><th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Acciones</th><td mat-cell *matCellDef="let element" class="px-4 py-3"><div class="flex items-center justify-end gap-1"><button type="button" class="btn-icon btn-flat-primary" (click)="openForm(element)" aria-label="Editar"><mat-icon>edit</mat-icon></button><button type="button" class="btn-icon btn-flat-accent" (click)="toggleStatus(element)" aria-label="{{ element.estado === 'A' ? 'Inactivar' : 'Activar' }}"><mat-icon>{{ element.estado === 'A' ? 'block' : 'check_circle' }}</mat-icon></button></div></td></ng-container>
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr><tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>
          <mat-paginator [length]="totalItems()" [pageSize]="pageSize()" [pageSizeOptions]="[10, 25, 50, 100]" (page)="onPageChange($event)" class="px-4 py-2 border-t border-gray-200 dark:border-gray-700"></mat-paginator>
        }
        @if (!loading() && data().length === 0) { <div class="text-center py-12 text-gray-500 dark:text-gray-400">No hay plantillas registradas</div> }
      </div>
    </div>
  `,
    styles: []
})
export class MessageTemplateListComponent implements OnInit {
    private service = inject(MessageTemplateService);
    private dialog = inject(MatDialog);

    loading = signal(false);
    data = signal<MensajePlantillaCorreoDTO[]>([]);
    totalItems = signal(0);
    pageSize = signal(25);
    currentPage = signal(0);

    filter: MensajePlantillaCorreoFilterDTO = { estado: 'A', nombre: '', tipo: '', paginacionRegistroInicial: 0, paginacionRegistroFinal: 25,
        filtroParametro: '',
        llaveTabla: '',
        securityToken: ''
    };
    displayedColumns = ['nombre', 'tipo', 'asunto', 'cuerpo', 'adjuntos', 'estado', 'acciones'];

    ngOnInit(): void { this.loadData(); }

    loadData(): void {
        this.loading.set(true);
        const f = this.filter;
        f.paginacionRegistroInicial = this.currentPage() * this.pageSize();
        f.paginacionRegistroFinal = f.paginacionRegistroInicial + this.pageSize();
        this.service.getTemplates(f).subscribe({ next: (res) => { this.data.set(res); this.totalItems.set(res.length); this.loading.set(false); }, error: () => this.loading.set(false) });
    }

    onFilterChange(): void { this.currentPage.set(0); this.loadData(); }
    onPageChange(event: PageEvent): void { this.currentPage.set(event.pageIndex); this.pageSize.set(event.pageSize); this.loadData(); }

    getTipoBadge(tipo: string): string {
        const badges: Record<string, string> = { 'EMAIL': 'badge-tipo-email', 'SMS': 'badge-tipo-sms', 'PUSH': 'badge-tipo-push' };
        return badges[tipo] || 'badge-secondary';
    }

    openForm(item?: MensajePlantillaCorreoDTO): void {
        const dialogRef = this.dialog.open(MessageTemplateFormComponent, { width: '800px', maxWidth: '90vw', data: item ? { ...item } : null });
        dialogRef.afterClosed().subscribe((result: MensajePlantillaCorreoDTO) => { if (result) this.loadData(); });
    }

    toggleStatus(item: MensajePlantillaCorreoDTO): void {
        const newEstado = item.estado === 'A' ? 'I' : 'A';
        const action = newEstado === 'A' ? 'activar' : 'inactivar';
        Swal.fire({ title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} plantilla?`, icon: 'question', showCancelButton: true, confirmButtonText: 'Sí', cancelButtonText: 'Cancelar' })
            .then((result) => { if (result.isConfirmed) { const updated = { ...item, estado: newEstado }; this.service.inactivateTemplate(updated).subscribe({ next: () => { Swal.fire('Éxito', `Plantilla ${action}da correctamente`, 'success'); this.loadData(); }, error: () => Swal.fire('Error', `No se pudo ${action} la plantilla`, 'error') }); }});
    }
}
