import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { DropdownComponent } from 'app/shared/components/dropdown/dropdown.component';
import { DropdownItemComponent } from 'app/shared/components/dropdown/dropdown-item.component';
import { OrganizacionDTO, OrganizacionFilterDTO } from 'app/document/document.types';
import { OrganizationService } from '../configuracion.api';
import { OrganizationFormComponent } from './organization-form.component';
import { PropertyPanelComponent } from '../shared/property-panel.component';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-organization-list',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule, MatInputModule, MatFormFieldModule, MatSelectModule, DropdownComponent, DropdownItemComponent],
    template: `
    <div class="p-4 sm:p-6 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Organizaciones</h1>
        <button type="button" class="btn-flat-primary" (click)="openForm()">
          <mat-icon>add</mat-icon>
          Nueva Organización
        </button>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <mat-form-field appearance="outline" class="w-full"><mat-label>Nombre</mat-label><input matInput [(ngModel)]="filter.nombre" (ngModelChange)="onFilterChange()" placeholder="Filtrar por nombre" /></mat-form-field>
          <mat-form-field appearance="outline" class="w-full"><mat-label>Código</mat-label><input matInput [(ngModel)]="filter.codigo" (ngModelChange)="onFilterChange()" placeholder="Filtrar por código" /></mat-form-field>
          <mat-form-field appearance="outline" class="w-full"><mat-label>Servidor</mat-label><input matInput [(ngModel)]="filter.servidor" (ngModelChange)="onFilterChange()" placeholder="Filtrar por servidor" /></mat-form-field>
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
                    @if (element.imagen) { <img [src]="element.imagen" class="w-10 h-10 rounded-lg object-cover shrink-0" alt="" /> } @else { <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><mat-icon class="text-primary">business</mat-icon></div> }
                    <div class="min-w-0">
                      <p class="text-xs font-mono text-gray-500 dark:text-gray-400">{{ element.codigo }}</p>
                      <h3 class="font-semibold text-gray-900 dark:text-gray-100 truncate">{{ element.nombre }}</h3>
                    </div>
                  </div>
                  <div class="flex items-center gap-1">
                    <button type="button" class="btn-icon btn-flat-primary" (click)="openProperties(element)" title="Propiedades" aria-label="Propiedades"><mat-icon>tune</mat-icon></button>
                    <app-dropdown>
                      <button type="button" class="btn-icon" trigger aria-label="Acciones"><mat-icon>more_vert</mat-icon></button>
                      <app-dropdown-item (clicked)="openForm(element)"><mat-icon class="text-base">edit</mat-icon> Editar</app-dropdown-item>
                      <app-dropdown-item (clicked)="openProperties(element)"><mat-icon class="text-base">tune</mat-icon> Propiedades</app-dropdown-item>
                      <app-dropdown-item (clicked)="toggleStatus(element)"><mat-icon class="text-base">{{ element.estado === 'A' ? 'block' : 'check_circle' }}</mat-icon> {{ element.estado === 'A' ? 'Inactivar' : 'Activar' }}</app-dropdown-item>
                    </app-dropdown>
                  </div>
                </div>
              </div>
            }
          </div>
          <div class="px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between gap-4">
            <span class="text-sm text-gray-500 dark:text-gray-400">Mostrando {{ data().length }} registros</span>
            @if (loading()) { <div class="w-40 h-1 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden"><div class="h-full bg-primary rounded animate-pulse" style="width: 40%;"></div></div> }
          </div>
        }
        @if (!loading() && data().length === 0) { <div class="text-center py-12 text-gray-500 dark:text-gray-400">No hay organizaciones registradas</div> }
      </div>
      <div #loadMore></div>
    </div>
  `,
    styles: []
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