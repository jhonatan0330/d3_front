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
import { ServidorDTO, ServidorFilterDTO } from 'app/document/document.types';
import { ServerService } from 'app/configuration/configuracion.api';
import { ServerFormComponent } from '../server-form/server-form.component';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-server-list',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule, MatInputModule, MatFormFieldModule, MatSelectModule, DropdownComponent, DropdownItemComponent],
    templateUrl: './server-list.component.html',
})
export class ServerListComponent implements OnInit, AfterViewInit, OnDestroy {
    private service = inject(ServerService);
    private dialog = inject(MatDialog);
    @ViewChild('loadMore') loadMoreRef!: ElementRef<HTMLDivElement>;
    private observer?: IntersectionObserver;

    loading = signal(false);
    data = signal<ServidorDTO[]>([]);
    currentPage = signal(0);
    hasMore = signal(true);
    private readonly pageSize = 25;

    filter: ServidorFilterDTO = { estado: 'A', nombre: '', tipo: '', orden: 0, puerto: '', servidorRespaldo: '', paginacionRegistroInicial: 0, paginacionRegistroFinal: 25,
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
        this.service.getServidores(f).subscribe({ next: (res) => { this.data.update(items => [...items, ...res]); this.currentPage.update(p => p + 1); if (res.length < this.pageSize) this.hasMore.set(false); this.loading.set(false); this.checkMore(); }, error: () => this.loading.set(false) });
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

    getTipoBadge(tipo: string): string {
        const badges: Record<string, string> = { 'F': 'badge-tipo-app', 'W': 'badge-tipo-web', 'B': 'badge-tipo-db', 'E': 'badge-tipo-mail' };
        return badges[tipo] || 'badge-secondary';
    }

    getTipoLabel(tipo: string): string {
        const labels: Record<string, string> = { 'F': 'FTP', 'W': 'Web', 'B': 'Base de Datos', 'E': 'Correo', 'L': 'FTP Local' };
        return labels[tipo] || tipo || '—';
    }

    openForm(item?: ServidorDTO): void {
        const dialogRef = this.dialog.open(ServerFormComponent, { disableClose: true, width: '700px', maxWidth: '90vw', data: item ? { ...item } : null });
        dialogRef.afterClosed().subscribe((result: ServidorDTO) => { if (result) this.reload(); });
    }

    toggleStatus(item: ServidorDTO): void {
        const newEstado = item.estado === 'A' ? 'I' : 'A';
        const action = newEstado === 'A' ? 'activar' : 'inactivar';
        Swal.fire({ title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} servidor?`, icon: 'question', showCancelButton: true, confirmButtonText: 'Sí', cancelButtonText: 'Cancelar' })
            .then((result) => { if (result.isConfirmed) { const updated = { ...item, estado: newEstado }; this.service.inactivateServidor(updated).subscribe({ next: () => { Swal.fire('Éxito', `Servidor ${action}do correctamente`, 'success'); this.reload(); }, error: () => Swal.fire('Error', `No se pudo ${action} el servidor`, 'error') }); }});
    }
}