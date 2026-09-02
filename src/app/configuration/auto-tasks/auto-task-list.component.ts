import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ProcesoTransicionAutomaticaDTO, ProcesoTransicionAutomaticaFilterDTO } from 'app/document/model/sw42.domain';
import { AutoTaskService } from '../configuracion.api';
import { AutoTaskFormComponent } from './auto-task-form.component';
import { AutoTaskScheduleDialogComponent } from './auto-task-schedule-dialog.component';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-auto-task-list',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule, MatTooltipModule, MatTableModule, MatPaginatorModule, MatInputModule, MatFormFieldModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule],
    template: `
    <div class="p-4 sm:p-6 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Tareas Automáticas</h1>
        <button type="button" class="btn-flat-primary" (click)="openForm()"><mat-icon>add</mat-icon> Nueva Tarea</button>
      </div>

      <!-- Filtros -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <mat-form-field appearance="outline" class="w-full"><mat-label>Proceso</mat-label><input matInput [(ngModel)]="filter.proceso" (ngModelChange)="onFilterChange()" placeholder="Filtrar por proceso" /></mat-form-field>
          <mat-form-field appearance="outline" class="w-full"><mat-label>Estado Origen</mat-label><input matInput [(ngModel)]="filter.estadoOrigen" (ngModelChange)="onFilterChange()" placeholder="Filtrar por estado origen" /></mat-form-field>
          <mat-form-field appearance="outline" class="w-full"><mat-label>Estado Destino</mat-label><input matInput [(ngModel)]="filter.estadoDestino" (ngModelChange)="onFilterChange()" placeholder="Filtrar por estado destino" /></mat-form-field>
          <mat-form-field appearance="outline" class="w-full"><mat-label>Fecha Desde</mat-label><input matInput [matDatepicker]="dp1" [(ngModel)]="filter.fechaDesde" (ngModelChange)="onFilterChange()" placeholder="DD/MM/YYYY" /><mat-datepicker-toggle matIconSuffix [for]="dp1"></mat-datepicker-toggle><mat-datepicker #dp1></mat-datepicker></mat-form-field>
          <mat-form-field appearance="outline" class="w-full"><mat-label>Fecha Hasta</mat-label><input matInput [matDatepicker]="dp2" [(ngModel)]="filter.fechaHasta" (ngModelChange)="onFilterChange()" placeholder="DD/MM/YYYY" /><mat-datepicker-toggle matIconSuffix [for]="dp2"></mat-datepicker-toggle><mat-datepicker #dp2></mat-datepicker></mat-form-field>
        </div>
        <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <mat-form-field appearance="outline" class="w-full"><mat-label>Activa</mat-label><mat-select [(ngModel)]="filter.activa" (ngModelChange)="onFilterChange()"><mat-option value="">Todas</mat-option><mat-option [value]="true">Sí</mat-option><mat-option [value]="false">No</mat-option></mat-select></mat-form-field>
          <mat-form-field appearance="outline" class="w-full"><mat-label>Estado</mat-label><mat-select [(ngModel)]="filter.estado" (ngModelChange)="onFilterChange()"><mat-option value="A">Activo</mat-option><mat-option value="I">Inactivo</mat-option><mat-option value="">Todos</mat-option></mat-select></mat-form-field>
        </div>
      </div>

      <!-- Tabla -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        @if (loading()) { <div class="flex justify-center py-12"><div class="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden"><div class="h-full bg-primary rounded animate-pulse" style="width: 40%;"></div></div></div> } @else {
          <div class="overflow-x-auto">
            <table mat-table [dataSource]="data()" class="w-full">
              <ng-container matColumnDef="nombre"><th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Nombre</th><td mat-cell *matCellDef="let element" class="px-4 py-3 font-medium">{{ element.nombre }}</td></ng-container>
              <ng-container matColumnDef="procesoNombre"><th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Proceso</th><td mat-cell *matCellDef="let element" class="px-4 py-3">{{ element.procesoNombre }}</td></ng-container>
              <ng-container matColumnDef="estadoOrigenNombre"><th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Estado Origen</th><td mat-cell *matCellDef="let element" class="px-4 py-3">{{ element.estadoOrigenNombre }}</td></ng-container>
              <ng-container matColumnDef="estadoDestinoNombre"><th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Estado Destino</th><td mat-cell *matCellDef="let element" class="px-4 py-3">{{ element.estadoDestinoNombre }}</td></ng-container>
              <ng-container matColumnDef="activa"><th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Activa</th><td mat-cell *matCellDef="let element" class="px-4 py-3"><span class="badge" [class.badge-success]="element.activa" [class.badge-secondary]="!element.activa">{{ element.activa ? 'Sí' : 'No' }}</span></td></ng-container>
              <ng-container matColumnDef="programa"><th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Programación</th><td mat-cell *matCellDef="let element" class="px-4 py-3 font-mono text-sm">{{ element.programa || 'Manual' }}</td></ng-container>
              <ng-container matColumnDef="fechaProgramada"><th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Próxima Ejecución</th><td mat-cell *matCellDef="let element" class="px-4 py-3">{{ element.fechaProgramada ? (element.fechaProgramada | date:'dd/MM/yyyy HH:mm') : '—' }}</td></ng-container>
              <ng-container matColumnDef="estado"><th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Estado</th><td mat-cell *matCellDef="let element" class="px-4 py-3"><span class="badge" [class.badge-success]="element.estado === 'A'" [class.badge-secondary]="element.estado === 'I'">{{ element.estado === 'A' ? 'Activo' : 'Inactivo' }}</span></td></ng-container>
              <ng-container matColumnDef="acciones"><th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Acciones</th><td mat-cell *matCellDef="let element" class="px-4 py-3"><div class="flex items-center justify-end gap-1"><button type="button" class="btn-icon btn-flat-primary" (click)="openForm(element)" aria-label="Editar"><mat-icon>edit</mat-icon></button><button type="button" class="btn-icon" (click)="openScheduleDialog(element)" aria-label="Programar" title="Programar" matTooltip="Programar"><mat-icon>schedule</mat-icon></button><button type="button" class="btn-icon text-green-600 hover:text-green-700" (click)="executeNow(element)" aria-label="Ejecutar Ahora" title="Ejecutar Ahora" matTooltip="Ejecutar Ahora"><mat-icon>play_circle_filled</mat-icon></button><button type="button" class="btn-icon btn-flat-accent" (click)="toggleStatus(element)" aria-label="{{ element.estado === 'A' ? 'Inactivar' : 'Activar' }}"><mat-icon>{{ element.estado === 'A' ? 'block' : 'check_circle' }}</mat-icon></button></div></td></ng-container>
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr><tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>
          <mat-paginator [length]="totalItems()" [pageSize]="pageSize()" [pageSizeOptions]="[10, 25, 50, 100]" (page)="onPageChange($event)" class="px-4 py-2 border-t border-gray-200 dark:border-gray-700"></mat-paginator>
        }
        @if (!loading() && data().length === 0) { <div class="text-center py-12 text-gray-500 dark:text-gray-400">No hay tareas automáticas registradas</div> }
      </div>
    </div>
  `,
    styles: []
})
export class AutoTaskListComponent implements OnInit {
    private service = inject(AutoTaskService);
    private dialog = inject(MatDialog);

    loading = signal(false);
    data = signal<ProcesoTransicionAutomaticaDTO[]>([]);
    totalItems = signal(0);
    pageSize = signal(25);
    currentPage = signal(0);

    filter: ProcesoTransicionAutomaticaFilterDTO = {
        estado: 'A',
        proceso: '',
        estadoOrigen: '',
        estadoDestino: '',
        activa: undefined,
        fechaDesde: undefined,
        fechaHasta: undefined,
        paginacionRegistroInicial: 0,
        paginacionRegistroFinal: 25,
        filtroParametro: '',
        llaveTabla: '',
        securityToken: ''
    };

    displayedColumns = ['nombre', 'procesoNombre', 'estadoOrigenNombre', 'estadoDestinoNombre', 'activa', 'programa', 'fechaProgramada', 'estado', 'acciones'];

    ngOnInit(): void { this.loadData(); }

    loadData(): void {
        this.loading.set(true);
        const f = this.filter;
        f.paginacionRegistroInicial = this.currentPage() * this.pageSize();
        f.paginacionRegistroFinal = f.paginacionRegistroInicial + this.pageSize();
        this.service.getAutoTasks(f).subscribe({ next: (res) => { this.data.set(res); this.totalItems.set(res.length); this.loading.set(false); }, error: () => this.loading.set(false) });
    }

    onFilterChange(): void { this.currentPage.set(0); this.loadData(); }
    onPageChange(event: PageEvent): void { this.currentPage.set(event.pageIndex); this.pageSize.set(event.pageSize); this.loadData(); }

    openForm(item?: ProcesoTransicionAutomaticaDTO): void {
        const dialogRef = this.dialog.open(AutoTaskFormComponent, { width: '700px', maxWidth: '90vw', data: item ? { ...item } : null });
        dialogRef.afterClosed().subscribe((result: ProcesoTransicionAutomaticaDTO) => { if (result) this.loadData(); });
    }

    openScheduleDialog(task: ProcesoTransicionAutomaticaDTO): void {
        const dialogRef = this.dialog.open(AutoTaskScheduleDialogComponent, { width: '500px', maxWidth: '90vw', data: { task } });
        dialogRef.afterClosed().subscribe((result) => { if (result) this.loadData(); });
    }

    executeNow(task: ProcesoTransicionAutomaticaDTO): void {
        Swal.fire({
            title: '¿Ejecutar ahora?',
            text: `Se ejecutará la tarea "${task.nombre}" inmediatamente.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, ejecutar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#4caf50'
        }).then((result) => {
            if (result.isConfirmed) {
                this.service.executeAutoTask(task.llaveTabla).subscribe({
                    next: (res) => { Swal.fire('Ejecutado', 'Tarea ejecutada correctamente', 'success'); this.loadData(); },
                    error: () => Swal.fire('Error', 'No se pudo ejecutar la tarea', 'error')
                });
            }
        });
    }

    toggleStatus(item: ProcesoTransicionAutomaticaDTO): void {
        const newEstado = item.estado === 'A' ? 'I' : 'A';
        const action = newEstado === 'A' ? 'activar' : 'inactivar';
        Swal.fire({ title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} tarea?`, icon: 'question', showCancelButton: true, confirmButtonText: 'Sí', cancelButtonText: 'Cancelar' })
            .then((result) => { if (result.isConfirmed) { const updated = { ...item, estado: newEstado }; this.service.inactivateAutoTask(updated).subscribe({ next: () => { Swal.fire('Éxito', `Tarea ${action}da correctamente`, 'success'); this.loadData(); }, error: () => Swal.fire('Error', `No se pudo ${action} la tarea`, 'error') }); }});
    }
}