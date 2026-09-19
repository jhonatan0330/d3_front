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
import { DropdownComponent } from 'app/shared/components/dropdown/dropdown/dropdown.component';
import { DropdownItemComponent } from 'app/shared/components/dropdown/dropdown-item/dropdown-item.component';
import { ProcesoTransicionAutomaticaDTO, ProcesoTransicionAutomaticaFilterDTO } from 'app/document/document.types';
import { AutoTaskService } from 'app/configuration/configuracion.api';
import { AutoTaskFormComponent } from '../auto-task-form/auto-task-form.component';
import { AutoTaskScheduleDialogComponent } from '../auto-task-schedule-dialog/auto-task-schedule-dialog.component';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';

@Component({
    selector: 'app-auto-task-list',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule, MatInputModule, MatFormFieldModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule, DropdownComponent, DropdownItemComponent],
    templateUrl: './auto-task-list.component.html',
})
export class AutoTaskListComponent implements OnInit, AfterViewInit, OnDestroy {
    private service = inject(AutoTaskService);
    private dialog = inject(MatDialog);
    @ViewChild('loadMore') loadMoreRef!: ElementRef<HTMLDivElement>;
    private observer?: IntersectionObserver;
    private notificationCenter = inject(NotificationCenterService);
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
        const dialogRef = this.dialog.open(AutoTaskFormComponent, { width: '700px', maxWidth: '90vw', disableClose: true, data: item ? { ...item } : null });
        dialogRef.afterClosed().subscribe((result: ProcesoTransicionAutomaticaDTO) => { if (result) this.reload(); });
    }

    openScheduleDialog(task: ProcesoTransicionAutomaticaDTO): void {
        const dialogRef = this.dialog.open(AutoTaskScheduleDialogComponent, { width: '500px', maxWidth: '90vw', disableClose: true, data: { task } });
        dialogRef.afterClosed().subscribe((result) => { if (result) this.reload(); });
    }

    executeNow(task: ProcesoTransicionAutomaticaDTO): void {
        this.notificationCenter.fire({
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
                    next: (res) => { this.notificationCenter.fire('Ejecutado', 'Tarea ejecutada correctamente', 'success'); this.reload(); },
                    error: () => this.notificationCenter.fire('Error', 'No se pudo ejecutar la tarea', 'error')
                });
            }
        });
    }

    toggleStatus(item: ProcesoTransicionAutomaticaDTO): void {
        const newEstado = item.estado === 'A' ? 'I' : 'A';
        const action = newEstado === 'A' ? 'activar' : 'inactivar';
        this.notificationCenter.fire({ title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} tarea?`, icon: 'question', showCancelButton: true, confirmButtonText: 'Sí', cancelButtonText: 'Cancelar' })
            .then((result) => { if (result.isConfirmed) { const updated = { ...item, estado: newEstado }; this.service.inactivateAutoTask(updated).subscribe({ next: () => { this.notificationCenter.fire('Éxito', `Tarea ${action}da correctamente`, 'success'); this.reload(); }, error: () => this.notificationCenter.fire('Error', `No se pudo ${action} la tarea`, 'error') }); }});
    }
}
