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
import { OrganizacionDTO, OrganizacionFilterDTO } from 'app/document/model/sw42.domain';
import { OrganizationService } from '../configuracion.api';
import { OrganizationFormComponent } from './organization-form.component';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-organization-list',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule, MatTableModule, MatPaginatorModule, MatInputModule, MatFormFieldModule, MatSelectModule],
    template: `
    <div class="p-4 sm:p-6 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Organizaciones</h1>
        <button type="button" class="btn-flat-primary" (click)="openForm()">
          <mat-icon>add</mat-icon>
          Nueva Organización
        </button>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <mat-form-field appearance="outline" class="w-full"><mat-label>Nombre</mat-label><input matInput [(ngModel)]="filter.nombre" (ngModelChange)="onFilterChange()" placeholder="Filtrar por nombre" /></mat-form-field>
          <mat-form-field appearance="outline" class="w-full"><mat-label>Código</mat-label><input matInput [(ngModel)]="filter.codigo" (ngModelChange)="onFilterChange()" placeholder="Filtrar por código" /></mat-form-field>
          <mat-form-field appearance="outline" class="w-full"><mat-label>NIT</mat-label><input matInput [(ngModel)]="filter.nit" (ngModelChange)="onFilterChange()" placeholder="Filtrar por NIT" /></mat-form-field>
          <mat-form-field appearance="outline" class="w-full"><mat-label>Estado</mat-label><mat-select [(ngModel)]="filter.estado" (ngModelChange)="onFilterChange()"><mat-option value="A">Activo</mat-option><mat-option value="I">Inactivo</mat-option><mat-option value="">Todos</mat-option></mat-select></mat-form-field>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        @if (loading()) { <div class="flex justify-center py-12"><div class="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden"><div class="h-full bg-primary rounded animate-pulse" style="width: 40%;"></div></div></div> } @else {
          <div class="overflow-x-auto">
            <table mat-table [dataSource]="data()" class="w-full">
              <ng-container matColumnDef="codigo"><th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Código</th><td mat-cell *matCellDef="let element" class="px-4 py-3 font-mono text-sm">{{ element.codigo }}</td></ng-container>
              <ng-container matColumnDef="nombre"><th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Nombre</th><td mat-cell *matCellDef="let element" class="px-4 py-3">{{ element.nombre }}</td></ng-container>
              <ng-container matColumnDef="nit"><th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">NIT</th><td mat-cell *matCellDef="let element" class="px-4 py-3">{{ element.nit }}</td></ng-container>
              <ng-container matColumnDef="direccion"><th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Dirección</th><td mat-cell *matCellDef="let element" class="px-4 py-3 text-sm">{{ element.direccion }}</td></ng-container>
              <ng-container matColumnDef="telefono"><th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Teléfono</th><td mat-cell *matCellDef="let element" class="px-4 py-3">{{ element.telefono }}</td></ng-container>
              <ng-container matColumnDef="email"><th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Email</th><td mat-cell *matCellDef="let element" class="px-4 py-3">{{ element.email }}</td></ng-container>
              <ng-container matColumnDef="principal"><th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Principal</th><td mat-cell *matCellDef="let element" class="px-4 py-3"><span class="badge" [class.badge-success]="element.principal" [class.badge-secondary]="!element.principal">{{ element.principal ? 'Sí' : 'No' }}</span></td></ng-container>
              <ng-container matColumnDef="estado"><th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Estado</th><td mat-cell *matCellDef="let element" class="px-4 py-3"><span class="badge" [class.badge-success]="element.estado === 'A'" [class.badge-secondary]="element.estado === 'I'">{{ element.estado === 'A' ? 'Activo' : 'Inactivo' }}</span></td></ng-container>
              <ng-container matColumnDef="acciones"><th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Acciones</th><td mat-cell *matCellDef="let element" class="px-4 py-3"><div class="flex items-center justify-end gap-1"><button type="button" class="btn-icon btn-flat-primary" (click)="openForm(element)" aria-label="Editar"><mat-icon>edit</mat-icon></button><button type="button" class="btn-icon btn-flat-accent" (click)="toggleStatus(element)" aria-label="{{ element.estado === 'A' ? 'Inactivar' : 'Activar' }}"><mat-icon>{{ element.estado === 'A' ? 'block' : 'check_circle' }}</mat-icon></button></div></td></ng-container>
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr><tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>
          <mat-paginator [length]="totalItems()" [pageSize]="pageSize()" [pageSizeOptions]="[10, 25, 50, 100]" (page)="onPageChange($event)" class="px-4 py-2 border-t border-gray-200 dark:border-gray-700"></mat-paginator>
        }
        @if (!loading() && data().length === 0) { <div class="text-center py-12 text-gray-500 dark:text-gray-400">No hay organizaciones registradas</div> }
      </div>
    </div>
  `,
    styles: []
})
export class OrganizationListComponent implements OnInit {
    private service = inject(OrganizationService);
    private dialog = inject(MatDialog);

    loading = signal(false);
    data = signal<OrganizacionDTO[]>([]);
    totalItems = signal(0);
    pageSize = signal(25);
    currentPage = signal(0);

    filter: OrganizacionFilterDTO = { estado: 'A', nombre: '', codigo: '', nit: '', principal: undefined, paginacionRegistroInicial: 0, paginacionRegistroFinal: 25,
        filtroParametro: '',
        llaveTabla: '',
        securityToken: ''
    };
    displayedColumns = ['codigo', 'nombre', 'nit', 'direccion', 'telefono', 'email', 'principal', 'estado', 'acciones'];

    ngOnInit(): void { this.loadData(); }

    loadData(): void {
        this.loading.set(true);
        const f = this.filter;
        f.paginacionRegistroInicial = this.currentPage() * this.pageSize();
        f.paginacionRegistroFinal = f.paginacionRegistroInicial + this.pageSize();
        this.service.getOrganizaciones(f).subscribe({ next: (res) => { this.data.set(res); this.totalItems.set(res.length); this.loading.set(false); }, error: () => this.loading.set(false) });
    }

    onFilterChange(): void { this.currentPage.set(0); this.loadData(); }
    onPageChange(event: PageEvent): void { this.currentPage.set(event.pageIndex); this.pageSize.set(event.pageSize); this.loadData(); }

    openForm(item?: OrganizacionDTO): void {
        const dialogRef = this.dialog.open(OrganizationFormComponent, { width: '700px', maxWidth: '90vw', data: item ? { ...item } : null });
        dialogRef.afterClosed().subscribe((result: OrganizacionDTO) => { if (result) this.loadData(); });
    }

    toggleStatus(item: OrganizacionDTO): void {
        const newEstado = item.estado === 'A' ? 'I' : 'A';
        const action = newEstado === 'A' ? 'activar' : 'inactivar';
        Swal.fire({ title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} organización?`, icon: 'question', showCancelButton: true, confirmButtonText: 'Sí', cancelButtonText: 'Cancelar' })
            .then((result) => { if (result.isConfirmed) { const updated = { ...item, estado: newEstado }; this.service.inactivateOrganizacion(updated).subscribe({ next: () => { Swal.fire('Éxito', `Organización ${action}da correctamente`, 'success'); this.loadData(); }, error: () => Swal.fire('Error', `No se pudo ${action} la organización`, 'error') }); }});
    }
}
