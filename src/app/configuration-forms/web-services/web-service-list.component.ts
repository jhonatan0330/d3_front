import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { WebServiceDTO, WebServiceFilterDTO, WebServiceEjecucionDTO, WebServiceEjecucionFilterDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { WebServiceConfigService } from './web-service.service';
import { WebServiceFormComponent } from './web-service-form.component';
import { WebServiceExecuteDialogComponent } from './web-service-execute-dialog.component';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-web-service-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatIconModule,
        MatButtonModule,
        MatTableModule,
        MatPaginatorModule,
        MatInputModule,
        MatFormFieldModule,
        MatTabsModule,
        MatSelectModule
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
            <mat-label>URL</mat-label>
            <input matInput [(ngModel)]="wsFilter.url" (ngModelChange)="onWsFilterChange()" placeholder="Filtrar por URL" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Método</mat-label>
            <mat-select [(ngModel)]="wsFilter.metodo" (ngModelChange)="onWsFilterChange()">
              <mat-option value="">Todos</mat-option>
              <mat-option value="GET">GET</mat-option>
              <mat-option value="POST">POST</mat-option>
              <mat-option value="PUT">PUT</mat-option>
              <mat-option value="DELETE">DELETE</mat-option>
            </mat-select>
          </mat-form-field>
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

      <!-- Tabs: Web Services | Ejecuciones -->
      <mat-tab-group [selectedIndex]="activeTab()" (selectedIndexChange)="activeTab.set($event)" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <mat-tab label="Web Services">
          <div class="p-4">
            @if (wsLoading()) {
              <div class="flex justify-center py-12"><mat-spinner diameter="40"></mat-spinner></div>
            } @else {
              <div class="overflow-x-auto">
                <table mat-table [dataSource]="wsData()" class="w-full">
                  <ng-container matColumnDef="nombre">
                    <th mat-header-cell class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Nombre</th>
                    <td mat-cell class="px-4 py-3 font-medium">{{ element.nombre }}</td>
                  </ng-container>
                  <ng-container matColumnDef="url">
                    <th mat-header-cell class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">URL</th>
                    <td mat-cell class="px-4 py-3 font-mono text-sm truncate max-w-xs">{{ element.url }}</td>
                  </ng-container>
                  <ng-container matColumnDef="metodo">
                    <th mat-header-cell class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Método</th>
                    <td mat-cell class="px-4 py-3">
                      <span class="badge" [class]="getMetodoBadge(element.metodo)">{{ element.metodo }}</span>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="autenticacion">
                    <th mat-header-cell class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Auth</th>
                    <td mat-cell class="px-4 py-3">{{ element.autenticacion || 'Ninguna' }}</td>
                  </ng-container>
                  <ng-container matColumnDef="timeout">
                    <th mat-header-cell class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Timeout (s)</th>
                    <td mat-cell class="px-4 py-3">{{ element.timeout }}</td>
                  </ng-container>
                  <ng-container matColumnDef="reintentos">
                    <th mat-header-cell class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Reintentos</th>
                    <td mat-cell class="px-4 py-3">{{ element.reintentos }}</td>
                  </ng-container>
                  <ng-container matColumnDef="estado">
                    <th mat-header-cell class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Estado</th>
                    <td mat-cell class="px-4 py-3">
                      <span class="badge" [class.badge-success]="element.estado === 'A'" [class.badge-secondary]="element.estado === 'I'">
                        {{ element.estado === 'A' ? 'Activo' : 'Inactivo' }}
                      </span>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="acciones">
                    <th mat-header-cell class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Acciones</th>
                    <td mat-cell class="px-4 py-3">
                      <div class="flex items-center justify-end gap-1">
                        <button type="button" class="btn-icon btn-flat-primary" (click)="openForm(element)" aria-label="Editar"><mat-icon>edit</mat-icon></button>
                        <button type="button" class="btn-icon" (click)="openExecuteDialog(element)" aria-label="Ejecutar" title="Ejecutar"><mat-icon>play_arrow</mat-icon></button>
                        <button type="button" class="btn-icon btn-flat-accent" (click)="toggleStatus(element)" aria-label="{{ element.estado === 'A' ? 'Inactivar' : 'Activar' }}"><mat-icon>{{ element.estado === 'A' ? 'block' : 'check_circle' }}</mat-icon></button>
                      </div>
                    </td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="wsDisplayedColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: wsDisplayedColumns;"></tr>
                </table>
              </div>
              <mat-paginator [length]="wsTotalItems()" [pageSize]="wsPageSize()" [pageSizeOptions]="[10, 25, 50, 100]" (page)="onWsPageChange($event)" class="px-4 py-2 border-t border-gray-200 dark:border-gray-700"></mat-paginator>
            }
            @if (!wsLoading() && wsData().length === 0) { <div class="text-center py-12 text-gray-500 dark:text-gray-400">No hay web services registrados</div> }
          </div>
        </mat-tab>

        <mat-tab label="Ejecuciones">
          <div class="p-4">
            <!-- Filtros ejecuciones -->
            <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-700">
              <div class="grid grid-cols-1 sm:grid-cols-5 gap-4">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Web Service</mat-label>
                  <mat-select [(ngModel)]="execFilter.webService" (ngModelChange)="onExecFilterChange()">
                    <mat-option value="">Todos</mat-option>
                    @for (ws of wsData(); track ws.llaveTabla) {
                      <mat-option [value]="ws.llaveTabla">{{ ws.nombre }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Estado</mat-label>
                  <mat-select [(ngModel)]="execFilter.estado" (ngModelChange)="onExecFilterChange()">
                    <mat-option value="A">Activo</mat-option>
                    <mat-option value="I">Inactivo</mat-option>
                    <mat-option value="E">Error</mat-option>
                    <mat-option value="">Todos</mat-option>
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Fecha Desde</mat-label>
                  <input matInput [matDatepicker]="dp1" [(ngModel)]="execFilter.fechaDesde" (ngModelChange)="onExecFilterChange()" placeholder="DD/MM/YYYY" />
                  <mat-datepicker-toggle matIconSuffix [for]="dp1"></mat-datepicker-toggle>
                  <mat-datepicker #dp1></mat-datepicker>
                </mat-form-field>
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Fecha Hasta</mat-label>
                  <input matInput [matDatepicker]="dp2" [(ngModel)]="execFilter.fechaHasta" (ngModelChange)="onExecFilterChange()" placeholder="DD/MM/YYYY" />
                  <mat-datepicker-toggle matIconSuffix [for]="dp2"></mat-datepicker-toggle>
                  <mat-datepicker #dp2></mat-datepicker>
                </mat-form-field>
              </div>
            </div>

            @if (execLoading()) {
              <div class="flex justify-center py-12"><mat-spinner diameter="40"></mat-spinner></div>
            } @else {
              <div class="overflow-x-auto">
                <table mat-table [dataSource]="execData()" class="w-full">
                  <ng-container matColumnDef="webServiceNombre">
                    <th mat-header-cell class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Web Service</th>
                    <td mat-cell class="px-4 py-3">{{ element.webServiceNombre }}</td>
                  </ng-container>
                  <ng-container matColumnDef="fechaEjecucion">
                    <th mat-header-cell class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Fecha Ejecución</th>
                    <td mat-cell class="px-4 py-3">{{ element.fechaEjecucion | date:'dd/MM/yyyy HH:mm:ss' }}</td>
                  </ng-container>
                  <ng-container matColumnDef="estado">
                    <th mat-header-cell class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Estado</th>
                    <td mat-cell class="px-4 py-3">
                      <span class="badge" [class]="getExecStatusBadge(element.estado)">
                        {{ getExecStatusLabel(element.estado) }}
                      </span>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="duracion">
                    <th mat-header-cell class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Duración (ms)</th>
                    <td mat-cell class="px-4 py-3">{{ element.duracion }}</td>
                  </ng-container>
                  <ng-container matColumnDef="parametrosEntrada">
                    <th mat-header-cell class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Parámetros</th>
                    <td mat-cell class="px-4 py-3 font-mono text-sm truncate max-w-xs">{{ element.parametrosEntrada }}</td>
                  </ng-container>
                  <ng-container matColumnDef="resultado">
                    <th mat-header-cell class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Resultado</th>
                    <td mat-cell class="px-4 py-3 font-mono text-sm truncate max-w-xs">{{ element.resultado }}</td>
                  </ng-container>
                  <ng-container matColumnDef="error">
                    <th mat-header-cell class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Error</th>
                    <td mat-cell class="px-4 py-3 text-red-600 dark:text-red-400 text-sm truncate max-w-xs">{{ element.error }}</td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="execDisplayedColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: execDisplayedColumns;"></tr>
                </table>
              </div>
              <mat-paginator [length]="execTotalItems()" [pageSize]="execPageSize()" [pageSizeOptions]="[10, 25, 50, 100]" (page)="onExecPageChange($event)" class="px-4 py-2 border-t border-gray-200 dark:border-gray-700"></mat-paginator>
            }
            @if (!execLoading() && execData().length === 0) { <div class="text-center py-12 text-gray-500 dark:text-gray-400">No hay ejecuciones registradas</div> }
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
    styles: [`
    .btn-flat-primary { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; border-radius: 4px; font-weight: 500; background: #3f51b5; color: white; border: none; }
    .btn-flat-primary:hover { background: #303f9f; }
    .btn-icon { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 50%; border: none; background: transparent; color: #666; cursor: pointer; }
    .btn-icon:hover { background: #f5f5f5; color: #333; }
    .btn-flat-accent { background: #f44336; color: white; }
    .btn-flat-accent:hover { background: #d32f2f; }
    .badge { padding: 0.125rem 0.5rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 500; }
    .badge-success { background: #e8f5e9; color: #2e7d32; }
    .badge-secondary { background: #f5f5f5; color: #757575; }
    .badge-metodo-get { background: #e3f2fd; color: #1565c0; }
    .badge-metodo-post { background: #e8f5e9; color: #2e7d32; }
    .badge-metodo-put { background: #fff3e0; color: #ef6c00; }
    .badge-metodo-delete { background: #fce4ec; color: #c62828; }
    .badge-exec-success { background: #e8f5e9; color: #2e7d32; }
    .badge-exec-error { background: #fce4ec; color: #c62828; }
    .badge-exec-pending { background: #fff3e0; color: #ef6c00; }
    :host ::ng-deep .mat-form-field { width: 100%; }
    :host ::ng-deep .mat-column-acciones { width: 140px; text-align: right; }
    :host ::ng-deep .mat-tab-header { background: #f5f5f5; }
    :host ::ng-deep .dark .mat-tab-header { background: #1e1e1e; }
  `]
})
export class WebServiceListComponent implements OnInit {
    private service = inject(WebServiceConfigService);
    private dialog = inject(MatDialog);

    activeTab = signal(0);

    // Web Services
    wsLoading = signal(false);
    wsData = signal<WebServiceDTO[]>([]);
    wsTotalItems = signal(0);
    wsPageSize = signal(25);
    wsCurrentPage = signal(0);
    wsFilter = signal<WebServiceFilterDTO>({ estado: 'A', nombre: '', url: '', metodo: '', paginacionRegistroInicial: 0, paginacionRegistroFinal: 25 });
    wsDisplayedColumns = ['nombre', 'url', 'metodo', 'autenticacion', 'timeout', 'reintentos', 'estado', 'acciones'];

    // Ejecuciones
    execLoading = signal(false);
    execData = signal<WebServiceEjecucionDTO[]>([]);
    execTotalItems = signal(0);
    execPageSize = signal(25);
    execCurrentPage = signal(0);
    execFilter = signal<WebServiceEjecucionFilterDTO>({ estado: 'A', webService: '', fechaDesde: undefined, fechaHasta: undefined, paginacionRegistroInicial: 0, paginacionRegistroFinal: 25 });
    execDisplayedColumns = ['webServiceNombre', 'fechaEjecucion', 'estado', 'duracion', 'parametrosEntrada', 'resultado', 'error'];

    ngOnInit(): void {
        this.loadWebServices();
    }

    loadWebServices(): void {
        this.wsLoading.set(true);
        const f = this.wsFilter();
        f.paginacionRegistroInicial = this.wsCurrentPage() * this.wsPageSize();
        f.paginacionRegistroFinal = f.paginacionRegistroInicial + this.wsPageSize();

        this.service.getWebServices(f).subscribe({
            next: (res) => { this.wsData.set(res); this.wsTotalItems.set(res.length); this.wsLoading.set(false); },
            error: () => this.wsLoading.set(false)
        });
    }

    onWsFilterChange(): void { this.wsCurrentPage.set(0); this.loadWebServices(); }
    onWsPageChange(event: PageEvent): void { this.wsCurrentPage.set(event.pageIndex); this.wsPageSize.set(event.pageSize); this.loadWebServices(); }

    loadExecutions(): void {
        this.execLoading.set(true);
        const f = this.execFilter();
        f.paginacionRegistroInicial = this.execCurrentPage() * this.execPageSize();
        f.paginacionRegistroFinal = f.paginacionRegistroInicial + this.execPageSize();

        this.service.getExecutions(f).subscribe({
            next: (res) => { this.execData.set(res); this.execTotalItems.set(res.length); this.execLoading.set(false); },
            error: () => this.execLoading.set(false)
        });
    }

    onExecFilterChange(): void { this.execCurrentPage.set(0); this.loadExecutions(); }
    onExecPageChange(event: PageEvent): void { this.execCurrentPage.set(event.pageIndex); this.execPageSize.set(event.pageSize); this.loadExecutions(); }

    openForm(item?: WebServiceDTO): void {
        const dialogRef = this.dialog.open(WebServiceFormComponent, {
            width: '700px', maxWidth: '90vw', data: item ? { ...item } : null
        });
        dialogRef.afterClosed().subscribe((result: WebServiceDTO) => { if (result) this.loadWebServices(); });
    }

    openExecuteDialog(ws: WebServiceDTO): void {
        const dialogRef = this.dialog.open(WebServiceExecuteDialogComponent, {
            width: '600px', maxWidth: '90vw', data: { webService: ws }
        });
        dialogRef.afterClosed().subscribe((result) => { if (result) this.loadExecutions(); });
    }

    toggleStatus(item: WebServiceDTO): void {
        const newEstado = item.estado === 'A' ? 'I' : 'A';
        const action = newEstado === 'A' ? 'activar' : 'inactivar';
        Swal.fire({ title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} web service?`, icon: 'question', showCancelButton: true, confirmButtonText: 'Sí', cancelButtonText: 'Cancelar' })
            .then((result) => { if (result.isConfirmed) { const updated = { ...item, estado: newEstado }; this.service.inactivateWebService(updated).subscribe({ next: () => { Swal.fire('Éxito', `Web Service ${action}do correctamente`, 'success'); this.loadWebServices(); }, error: () => Swal.fire('Error', `No se pudo ${action} el web service`, 'error') }); }});
    }

    getMetodoBadge(metodo: string): string {
        const badges: Record<string, string> = { 'GET': 'badge-metodo-get', 'POST': 'badge-metodo-post', 'PUT': 'badge-metodo-put', 'DELETE': 'badge-metodo-delete' };
        return badges[metodo] || 'badge-secondary';
    }

    getExecStatusLabel(estado: string): string {
        const labels: Record<string, string> = { 'A': 'Exitoso', 'E': 'Error', 'P': 'Pendiente' };
        return labels[estado] || estado;
    }

    getExecStatusBadge(estado: string): string {
        const badges: Record<string, string> = { 'A': 'badge-exec-success', 'E': 'badge-exec-error', 'P': 'badge-exec-pending' };
        return badges[estado] || 'badge-secondary';
    }
}