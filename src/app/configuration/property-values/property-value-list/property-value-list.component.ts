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
import { PropiedadValorDefinidoDTO, PropiedadValorDefinidoFilterDTO, BasicFilterDTO } from 'app/shared/shared.domain';
import { PropertyValueService } from 'app/configuration/configuracion.api';
import { PropertyValueFormComponent } from '../property-value-form/property-value-form.component';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-property-value-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule, DropdownComponent, DropdownItemComponent
    ],
    templateUrl: './property-value-list.component.html',
})
export class PropertyValueListComponent implements OnInit, AfterViewInit, OnDestroy {
    private service = inject(PropertyValueService);
    private dialog = inject(MatDialog);
    @ViewChild('loadMore') loadMoreRef!: ElementRef<HTMLDivElement>;
    private observer?: IntersectionObserver;

    loading = signal(false);
    data = signal<PropiedadValorDefinidoDTO[]>([]);
    currentPage = signal(0);
    hasMore = signal(true);
    private readonly pageSize = 25;

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
        this.service.getPropertyValues(f).subscribe({ next: (res) => { this.data.update(items => [...items, ...res]); this.currentPage.update(p => p + 1); if (res.length < this.pageSize) this.hasMore.set(false); this.loading.set(false); this.checkMore(); }, error: () => this.loading.set(false) });
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
            width: '600px', maxWidth: '90vw', disableClose: true, data: item ? { ...item } : null
        });
        dialogRef.afterClosed().subscribe((result: PropiedadValorDefinidoDTO) => { if (result) this.reload(); });
    }

    toggleStatus(item: PropiedadValorDefinidoDTO): void {
        const newEstado = item.estado === 'A' ? 'I' : 'A';
        const action = newEstado === 'A' ? 'activar' : 'inactivar';
        Swal.fire({ title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} valor?`, icon: 'question', showCancelButton: true, confirmButtonText: 'Sí', cancelButtonText: 'Cancelar' })
            .then((result) => {
                if (result.isConfirmed) {
                    const updated = { ...item, estado: newEstado };
                    this.service.inactivatePropertyValue(updated).subscribe({
                        next: () => { Swal.fire('Éxito', `Valor ${action}do correctamente`, 'success'); this.reload(); },
                        error: () => Swal.fire('Error', `No se pudo ${action} el valor`, 'error')
                    });
                }
            });
    }
}