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
import { OrganizacionDTO, OrganizacionFilterDTO } from 'app/document/document.types';
import { OrganizationService } from 'app/configuration/configuracion.api';
import { OrganizationFormComponent } from '../organization-form/organization-form.component';
import { PropertyPanelComponent } from '../../shared/property-panel/property-panel.component';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-organization-list',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule, MatInputModule, MatFormFieldModule, MatSelectModule, DropdownComponent, DropdownItemComponent],
    templateUrl: './organization-list.component.html',
})
export class OrganizationListComponent implements OnInit, AfterViewInit, OnDestroy {
    private service = inject(OrganizationService);
    private dialog = inject(MatDialog);
    @ViewChild('loadMore') loadMoreRef!: ElementRef<HTMLDivElement>;
    private observer?: IntersectionObserver;

    loading = signal(false);
    data = signal<OrganizacionDTO[]>([]);
    currentPage = signal(0);
    hasMore = signal(true);
    private readonly pageSize = 25;

    filter: OrganizacionFilterDTO = { estado: 'A', nombre: '', codigo: '', servidor: '', principal: '', usuarioSystem: '', imagen: '', sincronizacionFilter: '', servidorUrl: '', servidorCorreo: '', paginacionRegistroInicial: 0, paginacionRegistroFinal: 25,
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
        this.service.getOrganizaciones(f).subscribe({ next: (res) => { this.data.update(items => [...items, ...res]); this.currentPage.update(p => p + 1); if (res.length < this.pageSize) this.hasMore.set(false); this.loading.set(false); this.checkMore(); }, error: () => this.loading.set(false) });
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

    openForm(item?: OrganizacionDTO): void {
        const dialogRef = this.dialog.open(OrganizationFormComponent, { disableClose: true, width: '700px', maxWidth: '90vw', data: item ? { ...item } : null });
        dialogRef.afterClosed().subscribe((result: OrganizacionDTO) => { if (result) this.reload(); });
    }

    openProperties(item: OrganizacionDTO): void {
        this.dialog.open(PropertyPanelComponent, {
            disableClose: true,
            width: '800px', maxWidth: '95vw', maxHeight: '90vh',
            data: { campoKey: item.llaveTabla, tipoOrigen: 'O', titulo: item.nombre }
        });
    }

    toggleStatus(item: OrganizacionDTO): void {
        const newEstado = item.estado === 'A' ? 'I' : 'A';
        const action = newEstado === 'A' ? 'activar' : 'inactivar';
        Swal.fire({ title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} organización?`, icon: 'question', showCancelButton: true, confirmButtonText: 'Sí', cancelButtonText: 'Cancelar' })
            .then((result) => { if (result.isConfirmed) { const updated = { ...item, estado: newEstado }; this.service.inactivateOrganizacion(updated).subscribe({ next: () => { Swal.fire('Éxito', `Organización ${action}da correctamente`, 'success'); this.reload(); }, error: () => Swal.fire('Error', `No se pudo ${action} la organización`, 'error') }); }});
    }
}