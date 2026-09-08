import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { DropdownComponent } from 'app/shared/components/dropdown/dropdown.component';
import { DropdownItemComponent } from 'app/shared/components/dropdown/dropdown-item.component';
import { ConsecutivoDTO, ConsecutivoFilterDTO } from 'app/document/document.types';
import { ConsecutiveService } from '../configuracion.api';
import { ConsecutiveFormComponent } from './consecutive-form.component';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-consecutive-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatIconModule,
        MatPaginatorModule,
        MatInputModule,
        MatFormFieldModule, MatSelectModule, DropdownComponent, DropdownItemComponent
    ],
    template: `
    <div class="p-4 sm:p-6 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Consecutivos</h1>
        <button type="button" class="btn-flat-primary" (click)="openForm()">
          <mat-icon>add</mat-icon>
          Nuevo Consecutivo
        </button>
      </div>

      <!-- Filtros -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Nombre</mat-label>
            <input matInput [(ngModel)]="filter.nombre" (ngModelChange)="onFilterChange()" placeholder="Filtrar por nombre" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Prefijo</mat-label>
            <input matInput [(ngModel)]="filter.prefijo" (ngModelChange)="onFilterChange()" placeholder="Filtrar por prefijo" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Sufijo</mat-label>
            <input matInput [(ngModel)]="filter.sufijo" (ngModelChange)="onFilterChange()" placeholder="Filtrar por sufijo" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Manual</mat-label>
            <mat-select [(ngModel)]="manualFilter" (ngModelChange)="onManualFilterChange()">
              <mat-option value="">Todas</mat-option>
              <mat-option value="true">Sí</mat-option>
              <mat-option value="false">No</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Estado</mat-label>
            <mat-select [(ngModel)]="filter.estado" (ngModelChange)="onFilterChange()">
              <mat-option value="A">Activo</mat-option>
              <mat-option value="I">Inactivo</mat-option>
              <mat-option value="">Todos</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        @if (loading()) {
          <div class="flex justify-center py-12">
            <div class="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden"><div class="h-full bg-primary rounded animate-pulse" style="width: 40%;"></div></div>
          </div>
        } @else {
          <div class="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (element of data(); track element.llaveTabla) {
              <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 p-4 flex flex-col gap-3">
                <div class="flex items-start justify-between gap-2">
                  <div class="flex items-center gap-3 min-w-0">
                    <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><mat-icon class="text-primary">tag</mat-icon></div>
                    <div class="min-w-0">
                      <p class="text-xs font-mono text-gray-500 dark:text-gray-400">{{ element.prefijo }}{{ element.sufijo ? '-' + element.sufijo : '' }}</p>
                      <h3 class="font-semibold text-gray-900 dark:text-gray-100 truncate">{{ element.nombre }}</h3>
                    </div>
                  </div>
                  <app-dropdown>
                    <button type="button" class="btn-icon" trigger aria-label="Acciones"><mat-icon>more_vert</mat-icon></button>
                    <app-dropdown-item (clicked)="openForm(element)"><mat-icon class="text-base">edit</mat-icon> Editar</app-dropdown-item>
                    <app-dropdown-item (clicked)="assignConsecutivo(element)"><mat-icon class="text-base">assignment</mat-icon> Asignar consecutivo</app-dropdown-item>
                    <app-dropdown-item (clicked)="toggleStatus(element)"><mat-icon class="text-base">{{ element.estado === 'A' ? 'block' : 'check_circle' }}</mat-icon> {{ element.estado === 'A' ? 'Inactivar' : 'Activar' }}</app-dropdown-item>
                  </app-dropdown>
                </div>
                <dl class="grid grid-cols-2 gap-2 text-sm">
                  <div><dt class="text-xs text-gray-500 dark:text-gray-400">Consecutivo Actual</dt><dd class="font-mono text-gray-900 dark:text-gray-100">{{ element.consecutivoActual }}</dd></div>
                  <div><dt class="text-xs text-gray-500 dark:text-gray-400">Número Actual</dt><dd class="text-gray-900 dark:text-gray-100">{{ element.numeroActual }}</dd></div>
                  <div><dt class="text-xs text-gray-500 dark:text-gray-400">Rango</dt><dd class="font-mono text-gray-900 dark:text-gray-100">{{ element.numeroInicial }} - {{ element.numeroFinal }}</dd></div>
                  <div><dt class="text-xs text-gray-500 dark:text-gray-400">Padding</dt><dd class="text-gray-900 dark:text-gray-100">{{ element.padding }}</dd></div>
                </dl>
                <div class="flex items-center gap-2 mt-auto">
                  <span class="badge" [class.badge-info]="element.manual" [class.badge-secondary]="!element.manual">{{ element.manual ? 'Manual' : 'Automático' }}</span>
                  <span class="badge" [class.badge-success]="element.estado === 'A'" [class.badge-secondary]="element.estado === 'I'">{{ element.estado === 'A' ? 'Activo' : 'Inactivo' }}</span>
                </div>
              </div>
            }
          </div>
          <mat-paginator
            [length]="totalItems()"
            [pageSize]="pageSize()"
            [pageSizeOptions]="[10, 25, 50, 100]"
            (page)="onPageChange($event)"
            class="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
          </mat-paginator>
        }

        @if (!loading() && data().length === 0) {
          <div class="text-center py-12 text-gray-500 dark:text-gray-400">
            No hay consecutivos registrados
          </div>
        }
      </div>
    </div>
  `,
    styles: []
})
export class ConsecutiveListComponent implements OnInit {
    private service = inject(ConsecutiveService);
    private dialog = inject(MatDialog);

    loading = signal(false);
    data = signal<ConsecutivoDTO[]>([]);
    totalItems = signal(0);
    pageSize = signal(25);
    currentPage = signal(0);

    manualFilter: string = '';

    filter: ConsecutivoFilterDTO = {
        estado: 'A',
        nombre: '',
        prefijo: '',
        sufijo: '',
        padding: 0,
        consecutivoActual: '',
        paginacionRegistroInicial: 0,
        paginacionRegistroFinal: 25,
        filtroParametro: '',
        llaveTabla: '',
        securityToken: ''
    };

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.loading.set(true);
        const f = this.filter;
        f.paginacionRegistroInicial = this.currentPage() * this.pageSize();
        f.paginacionRegistroFinal = f.paginacionRegistroInicial + this.pageSize();

        this.service.getConsecutivos(f).subscribe({
            next: (res) => {
                this.data.set(res);
                this.totalItems.set(res.length > 0 ? res.length : 0);
                this.loading.set(false);
            },
            error: () => this.loading.set(false)
        });
    }

    onFilterChange(): void {
        this.currentPage.set(0);
        this.loadData();
    }

    onManualFilterChange(): void {
        this.filter.manualFilter = this.manualFilter === 'true' ? true : this.manualFilter === 'false' ? false : undefined;
        this.onFilterChange();
    }

    onPageChange(event: PageEvent): void {
        this.currentPage.set(event.pageIndex);
        this.pageSize.set(event.pageSize);
        this.loadData();
    }

    openForm(consecutivo?: ConsecutivoDTO): void {
        const dialogRef = this.dialog.open(ConsecutiveFormComponent, {
            width: '600px',
            maxWidth: '90vw',
            data: consecutivo ? { ...consecutivo } : null
        });

        dialogRef.afterClosed().subscribe((result: ConsecutivoDTO) => {
            if (result) {
                this.loadData();
            }
        });
    }

    toggleStatus(item: ConsecutivoDTO): void {
        const newEstado = item.estado === 'A' ? 'I' : 'A';
        const action = newEstado === 'A' ? 'activar' : 'inactivar';

        Swal.fire({
            title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} consecutivo?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                const updated = { ...item, estado: newEstado };
                this.service.inactivateConsecutivo(updated).subscribe({
                    next: () => {
                        Swal.fire('Éxito', `Consecutivo ${action}do correctamente`, 'success');
                        this.loadData();
                    },
                    error: () => Swal.fire('Error', `No se pudo ${action} el consecutivo`, 'error')
                });
            }
        });
    }

    assignConsecutivo(item: ConsecutivoDTO): void {
        this.service.assignConsecutivo(item).subscribe({
            next: (res) => {
                Swal.fire('Asignado', `Consecutivo asignado: ${res.consecutivoActual}`, 'success');
                this.loadData();
            },
            error: () => Swal.fire('Error', 'No se pudo asignar el consecutivo', 'error')
        });
    }
}