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
import { ServidorDTO, ServidorFilterDTO } from 'app/document/document.types';
import { ServerService } from '../configuracion.api';
import { ServerFormComponent } from './server-form.component';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-server-list',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule, MatPaginatorModule, MatInputModule, MatFormFieldModule, MatSelectModule, DropdownComponent, DropdownItemComponent],
    template: `
    <div class="p-4 sm:p-6 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Servidores</h1>
        <button type="button" class="btn-flat-primary" (click)="openForm()"><mat-icon>add</mat-icon> Nuevo Servidor</button>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <mat-form-field appearance="outline" class="w-full"><mat-label>Nombre</mat-label><input matInput [(ngModel)]="filter.nombre" (ngModelChange)="onFilterChange()" placeholder="Filtrar por nombre" /></mat-form-field>
          <mat-form-field appearance="outline" class="w-full"><mat-label>Tipo</mat-label><mat-select [(ngModel)]="filter.tipo" (ngModelChange)="onFilterChange()"><mat-option value="">Todos</mat-option><mat-option value="F">FTP</mat-option><mat-option value="W">Web</mat-option><mat-option value="B">Base de Datos</mat-option><mat-option value="E">Correo</mat-option><mat-option value="L">FTP Local</mat-option></mat-select></mat-form-field>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        @if (loading()) { <div class="flex justify-center py-12"><div class="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden"><div class="h-full bg-primary rounded animate-pulse" style="width: 40%;"></div></div></div> } @else {
          <div class="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (element of data(); track element.llaveTabla) {
              <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 p-4 flex flex-col gap-3">
                <div class="flex items-start justify-between gap-2">
                  <div class="flex items-center gap-3 min-w-0">
                    <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><mat-icon class="text-primary">dns</mat-icon></div>
                    <div class="min-w-0">
                      <span class="badge" [class]="getTipoBadge(element.tipo)">{{ getTipoLabel(element.tipo) }}</span>
                      <h3 class="font-semibold text-gray-900 dark:text-gray-100 truncate">{{ element.nombre }}</h3>
                    </div>
                  </div>
                  <app-dropdown>
                    <button type="button" class="btn-icon" trigger aria-label="Acciones"><mat-icon>more_vert</mat-icon></button>
                    <app-dropdown-item (clicked)="openForm(element)"><mat-icon class="text-base">edit</mat-icon> Editar</app-dropdown-item>
                    <app-dropdown-item (clicked)="toggleStatus(element)"><mat-icon class="text-base">{{ element.estado === 'A' ? 'block' : 'check_circle' }}</mat-icon> {{ element.estado === 'A' ? 'Inactivar' : 'Activar' }}</app-dropdown-item>
                  </app-dropdown>
                </div>
                <p class="text-sm font-mono text-gray-500 dark:text-gray-400 break-all">{{ element.url }}</p>
                <dl class="grid grid-cols-2 gap-2 text-sm">
                  <div><dt class="text-xs text-gray-500 dark:text-gray-400">Puerto</dt><dd class="text-gray-900 dark:text-gray-100">{{ element.puerto || '—' }}</dd></div>
                  <div><dt class="text-xs text-gray-500 dark:text-gray-400">Orden</dt><dd class="text-gray-900 dark:text-gray-100">{{ element.orden }}</dd></div>
                </dl>
                <div class="text-sm text-gray-500 dark:text-gray-400"><span class="text-xs">Servidor Respaldo</span><p class="text-gray-900 dark:text-gray-100 truncate">{{ element.servidorRespaldo || '—' }}</p></div>
                <div class="mt-auto flex items-center gap-2">
                  <span class="badge" [class.badge-success]="element.estado === 'A'" [class.badge-secondary]="element.estado === 'I'">{{ element.estado === 'A' ? 'Habilitado' : 'Deshabilitado' }}</span>
                </div>
              </div>
            }
          </div>
          <mat-paginator [length]="totalItems()" [pageSize]="pageSize()" [pageSizeOptions]="[10, 25, 50, 100]" (page)="onPageChange($event)" class="px-4 py-2 border-t border-gray-200 dark:border-gray-700"></mat-paginator>
        }
        @if (!loading() && data().length === 0) { <div class="text-center py-12 text-gray-500 dark:text-gray-400">No hay servidores registrados</div> }
      </div>
    </div>
  `,
    styles: []
})
export class ServerListComponent implements OnInit {
    private service = inject(ServerService);
    private dialog = inject(MatDialog);

    loading = signal(false);
    data = signal<ServidorDTO[]>([]);
    totalItems = signal(0);
    pageSize = signal(25);
    currentPage = signal(0);

    filter: ServidorFilterDTO = { estado: 'A', nombre: '', tipo: '', orden: 0, puerto: '', servidorRespaldo: '', paginacionRegistroInicial: 0, paginacionRegistroFinal: 25,
        filtroParametro: '',
        llaveTabla: '',
        securityToken: ''
    };

    ngOnInit(): void { this.loadData(); }

    loadData(): void {
        this.loading.set(true);
        const f = this.filter;
        f.paginacionRegistroInicial = this.currentPage() * this.pageSize();
        f.paginacionRegistroFinal = f.paginacionRegistroInicial + this.pageSize();
        this.service.getServidores(f).subscribe({ next: (res) => { this.data.set(res); this.totalItems.set(res.length); this.loading.set(false); }, error: () => this.loading.set(false) });
    }

    onFilterChange(): void { this.currentPage.set(0); this.loadData(); }
    onPageChange(event: PageEvent): void { this.currentPage.set(event.pageIndex); this.pageSize.set(event.pageSize); this.loadData(); }

    getTipoBadge(tipo: string): string {
        const badges: Record<string, string> = { 'F': 'badge-tipo-app', 'W': 'badge-tipo-web', 'B': 'badge-tipo-db', 'E': 'badge-tipo-mail' };
        return badges[tipo] || 'badge-secondary';
    }

    getTipoLabel(tipo: string): string {
        const labels: Record<string, string> = { 'F': 'FTP', 'W': 'Web', 'B': 'Base de Datos', 'E': 'Correo', 'L': 'FTP Local' };
        return labels[tipo] || tipo || '—';
    }

    openForm(item?: ServidorDTO): void {
        const dialogRef = this.dialog.open(ServerFormComponent, { width: '700px', maxWidth: '90vw', data: item ? { ...item } : null });
        dialogRef.afterClosed().subscribe((result: ServidorDTO) => { if (result) this.loadData(); });
    }

    toggleStatus(item: ServidorDTO): void {
        const newEstado = item.estado === 'A' ? 'I' : 'A';
        const action = newEstado === 'A' ? 'activar' : 'inactivar';
        Swal.fire({ title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} servidor?`, icon: 'question', showCancelButton: true, confirmButtonText: 'Sí', cancelButtonText: 'Cancelar' })
            .then((result) => { if (result.isConfirmed) { const updated = { ...item, estado: newEstado }; this.service.inactivateServidor(updated).subscribe({ next: () => { Swal.fire('Éxito', `Servidor ${action}do correctamente`, 'success'); this.loadData(); }, error: () => Swal.fire('Error', `No se pudo ${action} el servidor`, 'error') }); }});
    }
}
