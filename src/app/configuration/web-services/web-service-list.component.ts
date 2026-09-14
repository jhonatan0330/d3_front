import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { DropdownComponent } from 'app/shared/components/dropdown/dropdown.component';
import { DropdownItemComponent } from 'app/shared/components/dropdown/dropdown-item.component';
import { WebServiceDTO, WebServiceFilterDTO } from 'app/document/document.types';
import { WebServiceConfigService } from '../configuracion.api';
import { WebServiceFormComponent } from './web-service-form.component';
import { WebServiceExecuteDialogComponent } from './web-service-execute-dialog.component';
import { PropertyPanelComponent } from '../shared/property-panel.component';
import { ProcessSelectorComponent } from '../shared/process-selector.component';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-web-service-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatIconModule,
        MatTableModule,
        MatInputModule,
        MatFormFieldModule,
        MatTabsModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule, DropdownComponent, DropdownItemComponent, ProcessSelectorComponent
    ],
    template: `
    <div class="p-4 sm:p-6 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Web Services</h1>
        <button type="button" class="btn-flat-primary" (click)="openForm()">
          <mat-icon>add</mat-icon>
          Nuevo Web Service
        </button>
      </div>

      <!-- Filtros Web Services -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Nombre</mat-label>
            <input matInput [(ngModel)]="wsFilter.nombre" (ngModelChange)="onWsFilterChange()" placeholder="Filtrar por nombre" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Código</mat-label>
            <input matInput [(ngModel)]="wsFilter.codigo" (ngModelChange)="onWsFilterChange()" placeholder="Filtrar por código" />
          </mat-form-field>
          <div class="w-full"><app-process-selector [(ngModel)]="wsFilter.proceso" [label]="''" placeholder="Filtrar por proceso" (ngModelChange)="onWsFilterChange()"></app-process-selector></div>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Estado</mat-label>
            <mat-select [(ngModel)]="wsFilter.estado" (ngModelChange)="onWsFilterChange()">
              <mat-option value="A">Activo</mat-option>
              <mat-option value="I">Inactivo</mat-option>
              <mat-option value="">Todos</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </div>

      <!-- Lista Web Services -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="p-4">
          @if (wsLoading() && wsData().length === 0) {
            <div class="flex justify-center py-12"><div class="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden"><div class="h-full bg-primary rounded animate-pulse" style="width: 40%;"></div></div></div>
          } @else {
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              @for (element of wsData(); track element.llaveTabla) {
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 p-4 flex flex-col gap-3">
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex items-center gap-3 min-w-0 cursor-pointer rounded-lg p-1 -m-1 transition hover:bg-gray-900/5 dark:hover:bg-white/10" (click)="openForm(element)">
                      <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><mat-icon class="text-primary">api</mat-icon></div>
                      <div class="min-w-0">
                        <p class="text-xs font-mono text-gray-500 dark:text-gray-400 truncate">{{ element.codigo }}</p>
                        <h3 class="font-semibold text-gray-900 dark:text-gray-100 truncate">{{ element.nombre }}</h3>
                      </div>
                    </div>
                    <div class="flex items-center gap-1">
                      <button type="button" class="btn-icon btn-flat-primary" (click)="openProperties(element)" title="Propiedades" aria-label="Propiedades"><mat-icon>tune</mat-icon></button>
                      <app-dropdown>
                        <button type="button" class="btn-icon" trigger aria-label="Acciones"><mat-icon>more_vert</mat-icon></button>
                        <app-dropdown-item (clicked)="openForm(element)"><mat-icon class="text-base">edit</mat-icon> Editar</app-dropdown-item>
                        <app-dropdown-item (clicked)="openProperties(element)"><mat-icon class="text-base">tune</mat-icon> Propiedades</app-dropdown-item>
                        <app-dropdown-item (clicked)="openExecuteDialog(element)"><mat-icon class="text-base">play_arrow</mat-icon> Ejecutar</app-dropdown-item>
                        <app-dropdown-item (clicked)="toggleStatus(element)"><mat-icon class="text-base">{{ element.estado === 'A' ? 'block' : 'check_circle' }}</mat-icon> {{ element.estado === 'A' ? 'Inactivar' : 'Activar' }}</app-dropdown-item>
                      </app-dropdown>
                    </div>
                  </div>
                </div>
              }
            </div>
            <div class="px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between gap-4">
              <span class="text-sm text-gray-500 dark:text-gray-400">Mostrando {{ wsData().length }} registros</span>
              @if (wsLoading()) { <div class="w-40 h-1 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden"><div class="h-full bg-primary rounded animate-pulse" style="width: 40%;"></div></div> }
            </div>
          }
          @if (!wsLoading() && wsData().length === 0) { <div class="text-center py-12 text-gray-500 dark:text-gray-400">No hay web services registrados</div> }
        </div>
      </div>
      <div #loadMoreWs></div>
    </div>
  `,
    styles: []
})
export class WebServiceListComponent implements OnInit, AfterViewInit, OnDestroy {
    private service = inject(WebServiceConfigService);
    private dialog = inject(MatDialog);
    @ViewChild('loadMoreWs') loadMoreWsRef!: ElementRef<HTMLDivElement>;
    private wsObserver?: IntersectionObserver;

    private readonly pageSize = 25;

    // Web Services
    wsLoading = signal(false);
    wsData = signal<WebServiceDTO[]>([]);
    wsCurrentPage = signal(0);
    wsHasMore = signal(true);
    wsFilter: WebServiceFilterDTO = { estado: 'A', nombre: '', codigo: '', proceso: '', paginacionRegistroInicial: 0, paginacionRegistroFinal: 25, filtroParametro: '', llaveTabla: '', securityToken: '' };

    ngOnInit(): void {
        this.loadWsNext();
    }

    ngAfterViewInit(): void {
        this.wsObserver = new IntersectionObserver((entries) => { if (entries.some(e => e.isIntersecting)) this.loadWsNext(); });
        this.wsObserver.observe(this.loadMoreWsRef.nativeElement);
    }

    ngOnDestroy(): void {
        this.wsObserver?.disconnect();
    }

    loadWsNext(): void {
        if (this.wsLoading() || !this.wsHasMore()) return;
        this.wsLoading.set(true);
        const f = this.wsFilter;
        f.paginacionRegistroInicial = this.wsCurrentPage() * this.pageSize;
        f.paginacionRegistroFinal = this.pageSize;
        this.service.getWebServices(f).subscribe({
            next: (res) => { this.wsData.update(items => [...items, ...res]); this.wsCurrentPage.update(p => p + 1); if (res.length < this.pageSize) this.wsHasMore.set(false); this.wsLoading.set(false); this.checkWsMore(); },
            error: () => this.wsLoading.set(false)
        });
    }

    private checkWsMore(): void {
        requestAnimationFrame(() => {
            if (this.wsLoading() || !this.wsHasMore() || this.wsData().length === 0) return;
            const rect = this.loadMoreWsRef.nativeElement.getBoundingClientRect();
            if (rect.top < window.innerHeight) this.loadWsNext();
        });
    }

    reload(): void {
        this.wsCurrentPage.set(0);
        this.wsHasMore.set(true);
        this.wsData.set([]);
        this.loadWsNext();
    }

    onWsFilterChange(): void { this.reload(); }

    openForm(item?: WebServiceDTO): void {
        const dialogRef = this.dialog.open(WebServiceFormComponent, {
            disableClose: true,
            width: '700px', maxWidth: '90vw', data: item ? { ...item } : null
        });
        dialogRef.afterClosed().subscribe((result: WebServiceDTO) => { if (result) this.reload(); });
    }

    openExecuteDialog(ws: WebServiceDTO): void {
        const dialogRef = this.dialog.open(WebServiceExecuteDialogComponent, {
            disableClose: true,
            width: '600px', maxWidth: '90vw', data: { webService: ws }
        });
        dialogRef.afterClosed().subscribe((result) => { if (result) this.reload(); });
    }

    openProperties(item: WebServiceDTO): void {
        this.dialog.open(PropertyPanelComponent, {
            disableClose: true,
            width: '800px', maxWidth: '95vw', maxHeight: '90vh',
            data: { campoKey: item.llaveTabla, tipoOrigen: 'W', titulo: item.nombre }
        });
    }

    toggleStatus(item: WebServiceDTO): void {
        const newEstado = item.estado === 'A' ? 'I' : 'A';
        const action = newEstado === 'A' ? 'activar' : 'inactivar';
        Swal.fire({ title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} web service?`, icon: 'question', showCancelButton: true, confirmButtonText: 'Sí', cancelButtonText: 'Cancelar' })
            .then((result) => { if (result.isConfirmed) { const updated = { ...item, estado: newEstado }; this.service.inactivateWebService(updated).subscribe({ next: () => { Swal.fire('Éxito', `Web Service ${action}do correctamente`, 'success'); this.reload(); }, error: () => Swal.fire('Error', `No se pudo ${action} el web service`, 'error') }); }});
    }
}
