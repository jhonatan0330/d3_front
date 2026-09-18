import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { DropdownComponent } from 'app/shared/components/dropdown/dropdown/dropdown.component';
import { DropdownItemComponent } from 'app/shared/components/dropdown/dropdown-item/dropdown-item.component';
import { ConsecutivoDTO, ConsecutivoFilterDTO } from 'app/document/document.types';
import { ConsecutiveService } from 'app/configuration/configuracion.api';
import { ConsecutiveFormComponent } from '../consecutive-form/consecutive-form.component';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-consecutive-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule, MatSelectModule, DropdownComponent, DropdownItemComponent
    ],
    templateUrl: './consecutive-list.component.html',
})
export class ConsecutiveListComponent implements OnInit, AfterViewInit, OnDestroy {
    private service = inject(ConsecutiveService);
    private dialog = inject(MatDialog);
    @ViewChild('loadMore') loadMoreRef!: ElementRef<HTMLDivElement>;
    private observer?: IntersectionObserver;

    loading = signal(false);
    data = signal<ConsecutivoDTO[]>([]);
    currentPage = signal(0);
    hasMore = signal(true);
    private readonly pageSize = 25;

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
    };

    ngOnInit(): void {
        this.loadNext();
    }

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
        this.service.getConsecutivos(f).subscribe({ next: (res) => { this.data.update(items => [...items, ...res]); this.currentPage.update(p => p + 1); if (res.length < this.pageSize) this.hasMore.set(false); this.loading.set(false); this.checkMore(); }, error: () => this.loading.set(false) });
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

    onManualFilterChange(): void {
        this.filter.manualFilter = this.manualFilter === 'true' ? true : this.manualFilter === 'false' ? false : undefined;
        this.reload();
    }

    openForm(consecutivo?: ConsecutivoDTO): void {
        const dialogRef = this.dialog.open(ConsecutiveFormComponent, {
            disableClose: true,
            width: '600px',
            maxWidth: '90vw',
            data: consecutivo ? { ...consecutivo } : null
        });

        dialogRef.afterClosed().subscribe((result: ConsecutivoDTO) => {
            if (result) {
                this.reload();
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
                        this.reload();
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
                this.reload();
            },
            error: () => Swal.fire('Error', 'No se pudo asignar el consecutivo', 'error')
        });
    }
}