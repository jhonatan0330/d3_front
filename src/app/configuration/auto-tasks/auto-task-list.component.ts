import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { DropdownComponent } from 'app/shared/components/dropdown/dropdown.component';
import { DropdownItemComponent } from 'app/shared/components/dropdown/dropdown-item.component';
import { ProcesoTransicionAutomaticaDTO, ProcesoTransicionAutomaticaFilterDTO } from 'app/document/document.types';
import { AutoTaskService } from '../configuracion.api';
import { AutoTaskFormComponent } from './auto-task-form.component';
import { AutoTaskScheduleDialogComponent } from './auto-task-schedule-dialog.component';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-auto-task-list',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule, MatInputModule, MatFormFieldModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule, DropdownComponent, DropdownItemComponent],
    template: `
    <div class="p-4 sm:p-6 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Tareas Automáticas</h1>
        <button type="button" class="btn-flat-primary" (click)="openForm()"><mat-icon>add</mat-icon> Nueva Tarea</button>
      </div>

      <!-- Filtros -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <mat-form-field appearance="outline" class="w-full"><mat-label>Plantilla Nombre</mat-label><input matInput [(ngModel)]="filter.plantillaNombre" (ngModelChange)="onFilterChange()" placeholder="Filtrar por plantilla nombre" /></mat-form-field>
          <mat-form-field appearance="outline" class="w-full"><mat-label>Plantilla</mat-label><input matInput [(ngModel)]="filter.plantilla" (ngModelChange)="onFilterChange()" placeholder="Filtrar por plantilla" /></mat-form-field>
          <mat-form-field appearance="outline" class="w-full"><mat-label>Transición</mat-label><input matInput [(ngModel)]="filter.transicion" (ngModelChange)="onFilterChange()" placeholder="Filtrar por transición" /></mat-form-field>
          <mat-form-field appearance="outline" class="w-full"><mat-label>Propiedad</mat-label><input matInput [(ngModel)]="filter.propiedad" (ngModelChange)="onFilterChange()" placeholder="Filtrar por propiedad" /></mat-form-field>
          <mat-form-field appearance="outline" class="w-full"><mat-label>Fecha Desde</mat-label><input matInput [matDatepicker]="dp1" [(ngModel)]="filter.fechaMin" (ngModelChange)="onFilterChange()" placeholder="DD/MM/YYYY" /><mat-datepicker-toggle matIconSuffix [for]="dp1"></mat-datepicker-toggle><mat-datepicker #dp1></mat-datepicker></mat-form-field>
          <mat-form-field appearance="outline" class="w-full"><mat-label>Fecha Hasta</mat-label><input matInput [matDatepicker]="dp2" [(ngModel)]="filter.fechaMax" (ngModelChange)="onFilterChange()" placeholder="DD/MM/YYYY" /><mat-datepicker-toggle matIconSuffix [for]="dp2"></mat-datepicker-toggle><mat-datepicker #dp2></mat-datepicker></mat-form-field>
        </div>
        <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <mat-form-field appearance="outline" class="w-full"><mat-label>Estado</mat-label><mat-select [(ngModel)]="filter.estado" (ngModelChange)="onFilterChange()"><mat-option value="A">Activo</mat-option><mat-option value="I">Inactivo</mat-option><mat-option value="">Todos</mat-option></mat-select></mat-form-field>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        @if (loading() && data().length === 0) { <div class="flex justify-center py-12"><div class="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden"><div class="h-full bg-primary rounded animate-pulse" style="width: 40%;"></div></div></div> } @else {
          <div class="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (element of data(); track element.llaveTabla) {
              <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 p-4 flex flex-col gap-3">
                <div class="flex items-start justify-between gap-2">
                  <div class="flex items-center gap-3 min-w-0 cursor-pointer rounded-lg p-1 -m-1 transition hover:bg-gray-900/5 dark:hover:bg-white/10" (click)="openForm(element)">
                    <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><mat-icon class="text-primary">schedule</mat-icon></div>
                    <div class="min-w-0">
                      <h3 class="font-semibold text-gray-900 dark:text-gray-100 truncate">{{ element.plantillaNombre }}</h3>
                    </div>
                  </div>
                  <app-dropdown>
                    <button type="button" class="btn-icon" trigger aria-label="Acciones"><mat-icon>more_vert</mat-icon></button>
                    <app-dropdown-item (clicked)="openForm(element)"><mat-icon class="text-base">edit</mat-icon> Editar</app-dropdown-item>
                    <app-dropdown-item (clicked)="openScheduleDialog(element)"><mat-icon class="text-base">schedule</mat-icon> Programar</app-dropdown-item>
                    <app-dropdown-item (clicked)="executeNow(element)"><mat-icon class="text-base">play_circle_filled</mat-icon> Ejecutar ahora</app-dropdown-item>
                    <app-dropdown-item (clicked)="toggleStatus(element)"><mat-icon class="text-base">{{ element.estado === 'A' ? 'block' : 'check_circle' }}</mat-icon> {{ element.estado === 'A' ? 'Inactivar' : 'Activar' }}</app-dropdown-item>
                  </app-dropdown>
                </div>
              </div>
            }
          </div>
          <div class="px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between gap-4">
            <span class="text-sm text-gray-500 dark:text-gray-400">Mostrando {{ data().length }} registros</span>
            @if (loading()) { <div class="w-40 h-1 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden"><div class="h-full bg-primary rounded animate-pulse" style="width: 40%;"></div></div> }
          </div>
        }
        @if (!loading() && data().length === 0) { <div class="text-center py-12 text-gray-500 dark:text-gray-400">No hay tareas automáticas registradas</div> }
      </div>
      <div #loadMore></div>
    </div>
  `,
    styles: []
})
export class AutoTaskListComponent implements OnInit, AfterViewInit, OnDestroy {
    private service = inject(AutoTaskService);
    private dialog = inject(MatDialog);
    @ViewChild('loadMore') loadMoreRef!: ElementRef<HTMLDivElement>;
    private observer?: IntersectionObserver;

    loading = signal(false);
    data = signal<ProcesoTransicionAutomaticaDTO[]>([]);
    currentPage = signal(0);
    hasMore = signal(true);
    private readonly pageSize = 25;

    filter: ProcesoTransicionAutomaticaFilterDTO = {
        estado: 'A',
        plantilla: '',
        plantillaNombre: '',
        transicion: '',
        propiedad: '',
        fechaMin: undefined,
        fechaMax: undefined,
        paginacionRegistroInicial: 0,
        paginacionRegistroFinal: 25,
        filtroParametro: '',
        llaveTabla: '',
        securityToken: ''
    };

    ngOnInit(): void { this.loadNext(); }

    ngAfterViewInit(): void {
        this.observer = new IntersectionObserver((entries) => { if (entries.some(e => e.isIntersecting)) this.loadNext(); });
        this.observer.observe(this.loadMoreRef.nativeElement);
    }

    ngOnDestroy(): void {
        this.observer?.disconnect();
    }

    loadNext(): void {
        if (this.loading() || !this.hasMore()) return;
        this.loading.set(true);
        const f = this.filter;
        f.paginacionRegistroInicial = this.currentPage() * this.pageSize;
        f.paginacionRegistroFinal = this.pageSize;
        this.service.getAutoTasks(f).subscribe({ next: (res) => { this.data.update(items => [...items, ...res]); this.currentPage.update(p => p + 1); if (res.length < this.pageSize) this.hasMore.set(false); this.loading.set(false); this.checkMore(); }, error: () => this.loading.set(false) });
    }

    private checkMore(): void {
        requestAnimationFrame(() => {
            if (this.loading() || !this.hasMore() || this.data().length === 0) return;
            const rect = this.loadMoreRef.nativeElement.getBoundingClientRect();
            if (rect.top < window.innerHeight) this.loadNext();
        });
    }

    reload(): void {
        this.currentPage.set(0);
        this.hasMore.set(true);
        this.data.set([]);
        this.loadNext();
    }

    onFilterChange(): void { this.reload(); }

    openForm(item?: ProcesoTransicionAutomaticaDTO): void {
        const dialogRef = this.dialog.open(AutoTaskFormComponent, { width: '700px', maxWidth: '90vw', data: item ? { ...item } : null });
        dialogRef.afterClosed().subscribe((result: ProcesoTransicionAutomaticaDTO) => { if (result) this.reload(); });
    }

    openScheduleDialog(task: ProcesoTransicionAutomaticaDTO): void {
        const dialogRef = this.dialog.open(AutoTaskScheduleDialogComponent, { width: '500px', maxWidth: '90vw', data: { task } });
        dialogRef.afterClosed().subscribe((result) => { if (result) this.reload(); });
    }

    executeNow(task: ProcesoTransicionAutomaticaDTO): void {
        Swal.fire({
            title: '¿Ejecutar ahora?',
            text: `Se ejecutará la tarea "${task.plantillaNombre}" inmediatamente.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, ejecutar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#4caf50'
        }).then((result) => {
            if (result.isConfirmed) {
                this.service.executeAutoTask(task.llaveTabla).subscribe({
                    next: (res) => { Swal.fire('Ejecutado', 'Tarea ejecutada correctamente', 'success'); this.reload(); },
                    error: () => Swal.fire('Error', 'No se pudo ejecutar la tarea', 'error')
                });
            }
        });
    }

    toggleStatus(item: ProcesoTransicionAutomaticaDTO): void {
        const newEstado = item.estado === 'A' ? 'I' : 'A';
        const action = newEstado === 'A' ? 'activar' : 'inactivar';
        Swal.fire({ title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} tarea?`, icon: 'question', showCancelButton: true, confirmButtonText: 'Sí', cancelButtonText: 'Cancelar' })
            .then((result) => { if (result.isConfirmed) { const updated = { ...item, estado: newEstado }; this.service.inactivateAutoTask(updated).subscribe({ next: () => { Swal.fire('Éxito', `Tarea ${action}da correctamente`, 'success'); this.reload(); }, error: () => Swal.fire('Error', `No se pudo ${action} la tarea`, 'error') }); }});
    }
}