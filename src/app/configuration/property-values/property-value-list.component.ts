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
import { PropiedadValorDefinidoDTO, PropiedadValorDefinidoFilterDTO, BasicFilterDTO } from 'app/shared/shared.domain';
import { PropertyValueService } from '../configuracion.api';
import { PropertyValueFormComponent } from './property-value-form.component';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-property-value-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatIconModule,
        MatTableModule,
        MatPaginatorModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule
    ],
    template: `
    <div class="p-4 sm:p-6 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Valores Definidos</h1>
        <button type="button" class="btn-flat-primary" (click)="openForm()">
          <mat-icon>add</mat-icon>
          Nuevo Valor
        </button>
      </div>

      <!-- Filtros -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Origen</mat-label>
            <mat-select [(ngModel)]="filter.origen" (ngModelChange)="onFilterChange()">
              <mat-option value="">Todos</mat-option>
              <mat-option value="C">Campo (C)</mat-option>
              <mat-option value="L">Plantilla (L)</mat-option>
              <mat-option value="P">Proceso (P)</mat-option>
              <mat-option value="D">Documento (D)</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Categoría Origen</mat-label>
            <input matInput [(ngModel)]="filter.origenCategoria" (ngModelChange)="onFilterChange()" placeholder="Filtrar por categoría" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Nombre</mat-label>
            <input matInput [(ngModel)]="filter.nombre" (ngModelChange)="onFilterChange()" placeholder="Filtrar por nombre" />
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

      <!-- Tabla -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        @if (loading()) {
          <div class="flex justify-center py-12"><div class="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden"><div class="h-full bg-primary rounded animate-pulse" style="width: 40%;"></div></div></div>
        } @else {
          <div class="overflow-x-auto">
            <table mat-table [dataSource]="data()" class="w-full">
              <ng-container matColumnDef="codigo">
                <th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Código</th>
                <td mat-cell *matCellDef="let element" class="px-4 py-3 font-mono text-sm">{{ element.codigo }}</td>
              </ng-container>

              <ng-container matColumnDef="nombre">
                <th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Nombre</th>
                <td mat-cell *matCellDef="let element" class="px-4 py-3">{{ element.nombre }}</td>
              </ng-container>

              <ng-container matColumnDef="origen">
                <th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Origen</th>
                <td mat-cell *matCellDef="let element" class="px-4 py-3">
                  <span class="badge" [class]="getOrigenBadge(element.origen)">{{ getOrigenLabel(element.origen) }}</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="origenCategoria">
                <th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Categoría</th>
                <td mat-cell *matCellDef="let element" class="px-4 py-3 text-sm">{{ element.origenCategoria }}</td>
              </ng-container>

              <ng-container matColumnDef="grupo">
                <th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Grupo</th>
                <td mat-cell *matCellDef="let element" class="px-4 py-3 text-sm">{{ element.grupo }}</td>
              </ng-container>

              <ng-container matColumnDef="flags">
                <th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Flags</th>
                <td mat-cell *matCellDef="let element" class="px-4 py-3">
                  <div class="flex flex-wrap gap-1">
                    @if (element.pideRol) { <span class="badge badge-info text-xs">Rol</span> }
                    @if (element.pideUsuario) { <span class="badge badge-info text-xs">Usuario</span> }
                    @if (element.pideFechas) { <span class="badge badge-warning text-xs">Fechas</span> }
                    @if (element.pideTiempoBloqueo) { <span class="badge badge-warning text-xs">Bloqueo</span> }
                    @if (element.multiple) { <span class="badge badge-success text-xs">Múltiple</span> }
                    @if (element.propiedadBoolean) { <span class="badge badge-secondary text-xs">Boolean</span> }
                    @if (element.necesitaDesarrollo) { <span class="badge badge-error text-xs">Dev</span> }
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="estado">
                <th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Estado</th>
                <td mat-cell *matCellDef="let element" class="px-4 py-3">
                  <span class="badge" [class.badge-success]="element.estado === 'A'" [class.badge-secondary]="element.estado === 'I'">
                    {{ element.estado === 'A' ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="acciones">
                <th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Acciones</th>
                <td mat-cell *matCellDef="let element" class="px-4 py-3">
                  <div class="flex items-center justify-end gap-1">
                    <button type="button" class="btn-icon btn-flat-primary" (click)="openForm(element)" aria-label="Editar"><mat-icon>edit</mat-icon></button>
                    <button type="button" class="btn-icon btn-flat-accent" (click)="toggleStatus(element)" aria-label="{{ element.estado === 'A' ? 'Inactivar' : 'Activar' }}"><mat-icon>{{ element.estado === 'A' ? 'block' : 'check_circle' }}</mat-icon></button>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>

          <mat-paginator [length]="totalItems()" [pageSize]="pageSize()" [pageSizeOptions]="[10, 25, 50, 100]" (page)="onPageChange($event)" class="px-4 py-2 border-t border-gray-200 dark:border-gray-700"></mat-paginator>
        }

        @if (!loading() && data().length === 0) {
          <div class="text-center py-12 text-gray-500 dark:text-gray-400">No hay valores definidos registrados</div>
        }
      </div>
    </div>
  `,
    styles: []
})
export class PropertyValueListComponent implements OnInit {
    private service = inject(PropertyValueService);
    private dialog = inject(MatDialog);

    loading = signal(false);
    data = signal<PropiedadValorDefinidoDTO[]>([]);
    totalItems = signal(0);
    pageSize = signal(25);
    currentPage = signal(0);

    filter: PropiedadValorDefinidoFilterDTO = {
        estado: 'A',
        origen: '',
        origenCategoria: '',
        codigo: '',
        nombre: '',
        grupo: '',
        paginacionRegistroInicial: 0,
        paginacionRegistroFinal: 25,
        filtroParametro: '',
        llaveTabla: '',
        securityToken: ''
    };

    displayedColumns = ['codigo', 'nombre', 'origen', 'origenCategoria', 'grupo', 'flags', 'estado', 'acciones'];

    ngOnInit(): void { this.loadData(); }

    loadData(): void {
        this.loading.set(true);
        const f = this.filter;
        f.paginacionRegistroInicial = this.currentPage() * this.pageSize();
        f.paginacionRegistroFinal = f.paginacionRegistroInicial + this.pageSize();

        this.service.getPropertyValues(f).subscribe({
            next: (res) => { this.data.set(res); this.totalItems.set(res.length); this.loading.set(false); },
            error: () => this.loading.set(false)
        });
    }

    onFilterChange(): void { this.currentPage.set(0); this.loadData(); }

    onPageChange(event: PageEvent): void { this.currentPage.set(event.pageIndex); this.pageSize.set(event.pageSize); this.loadData(); }

    getOrigenLabel(origen: string): string {
        const labels: Record<string, string> = { 'C': 'Campo', 'L': 'Plantilla', 'P': 'Proceso', 'D': 'Documento' };
        return labels[origen] || origen;
    }

    getOrigenBadge(origen: string): string {
        const badges: Record<string, string> = { 'C': 'badge-origen-c', 'L': 'badge-origen-l', 'P': 'badge-origen-p', 'D': 'badge-origen-d' };
        return badges[origen] || 'badge-secondary';
    }

    openForm(item?: PropiedadValorDefinidoDTO): void {
        const dialogRef = this.dialog.open(PropertyValueFormComponent, {
            width: '600px', maxWidth: '90vw', data: item ? { ...item } : null
        });
        dialogRef.afterClosed().subscribe((result: PropiedadValorDefinidoDTO) => { if (result) this.loadData(); });
    }

    toggleStatus(item: PropiedadValorDefinidoDTO): void {
        const newEstado = item.estado === 'A' ? 'I' : 'A';
        const action = newEstado === 'A' ? 'activar' : 'inactivar';
        Swal.fire({ title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} valor?`, icon: 'question', showCancelButton: true, confirmButtonText: 'Sí', cancelButtonText: 'Cancelar' })
            .then((result) => {
                if (result.isConfirmed) {
                    const updated = { ...item, estado: newEstado };
                    this.service.inactivatePropertyValue(updated).subscribe({
                        next: () => { Swal.fire('Éxito', `Valor ${action}do correctamente`, 'success'); this.loadData(); },
                        error: () => Swal.fire('Error', `No se pudo ${action} el valor`, 'error')
                    });
                }
            });
    }
}