import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { WebServiceEjecucionDTO, WebServiceEjecucionFilterDTO } from 'app/document/document.types';
import { WebServiceConfigService } from '../configuracion.api';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-web-service-execute-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatIconModule,
        MatTableModule,
        MatInputModule,
        MatFormFieldModule,
        MatDatepickerModule,
        MatNativeDateModule
    ],
    template: `
    <div class="p-4 sm:p-6 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Ejecuciones Web Service</h1>
      </div>

      <!-- Filtros -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Fecha Desde *</mat-label>
            <input matInput [matDatepicker]="dp1" [(ngModel)]="execFilter.fechaEjecucionMin" (ngModelChange)="onExecFilterChange()" placeholder="DD/MM/YYYY" required />
            <mat-datepicker-toggle matIconSuffix [for]="dp1"></mat-datepicker-toggle>
            <mat-datepicker #dp1></mat-datepicker>
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Fecha Hasta *</mat-label>
            <input matInput [matDatepicker]="dp2" [(ngModel)]="execFilter.fechaEjecucionMax" (ngModelChange)="onExecFilterChange()" placeholder="DD/MM/YYYY" required />
            <mat-datepicker-toggle matIconSuffix [for]="dp2"></mat-datepicker-toggle>
            <mat-datepicker #dp2></mat-datepicker>
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Servicio</mat-label>
            <input matInput [(ngModel)]="execFilter.servicio" (ngModelChange)="onExecFilterChange()" placeholder="Filtrar por servicio" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Usuario</mat-label>
            <input matInput [(ngModel)]="execFilter.usuario" (ngModelChange)="onExecFilterChange()" placeholder="Filtrar por usuario" />
          </mat-form-field>
        </div>
      </div>

      <!-- Lista -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        @if (!datesValid()) {
          <div class="p-6 text-center text-amber-600 dark:text-amber-400 text-sm font-medium">
            <mat-icon class="align-middle mr-1">warning</mat-icon>
            Debe seleccionar las fechas Desde y Hasta para consultar las ejecuciones.
          </div>
        } @else {
          @if (execLoading() && execData().length === 0) {
            <div class="flex justify-center py-12"><div class="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden"><div class="h-full bg-primary rounded animate-pulse" style="width: 40%;"></div></div></div>
          } @else {
            <div class="overflow-x-auto">
              <table mat-table [dataSource]="execData()" class="w-full">
                <ng-container matColumnDef="servicio">
                  <th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Servicio</th>
                  <td mat-cell *matCellDef="let element" class="px-4 py-3">{{ element.servicio }}</td>
                </ng-container>
                <ng-container matColumnDef="usuario">
                  <th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Usuario</th>
                  <td mat-cell *matCellDef="let element" class="px-4 py-3">{{ element.usuario }}</td>
                </ng-container>
                <ng-container matColumnDef="fechaEjecucion">
                  <th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Fecha Ejecución</th>
                  <td mat-cell *matCellDef="let element" class="px-4 py-3">{{ element.fechaEjecucion | date:'dd/MM/yyyy HH:mm:ss' }}</td>
                </ng-container>
                <ng-container matColumnDef="entrada">
                  <th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Entrada</th>
                  <td mat-cell *matCellDef="let element" class="px-4 py-3 font-mono text-sm truncate max-w-xs">{{ element.entrada }}</td>
                </ng-container>
                <ng-container matColumnDef="salida">
                  <th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Salida</th>
                  <td mat-cell *matCellDef="let element" class="px-4 py-3 font-mono text-sm truncate max-w-xs">{{ element.salida }}</td>
                </ng-container>
                <ng-container matColumnDef="error">
                  <th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Error</th>
                  <td mat-cell *matCellDef="let element" class="px-4 py-3 text-red-600 dark:text-red-400 text-sm truncate max-w-xs">{{ element.error }}</td>
                </ng-container>
                <ng-container matColumnDef="sincrona">
                  <th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Síncrona</th>
                  <td mat-cell *matCellDef="let element" class="px-4 py-3">{{ element.sincrona === 'S' ? 'Sí' : 'No' }}</td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="execDisplayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: execDisplayedColumns;"></tr>
              </table>
            </div>
            <div class="px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between gap-4">
              <span class="text-sm text-gray-500 dark:text-gray-400">Mostrando {{ execData().length }} registros</span>
              @if (execLoading()) { <div class="w-40 h-1 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden"><div class="h-full bg-primary rounded animate-pulse" style="width: 40%;"></div></div> }
            </div>
          }
          @if (!execLoading() && execData().length === 0) { <div class="text-center py-12 text-gray-500 dark:text-gray-400">No hay ejecuciones registradas en el rango seleccionado</div> }
        }
      </div>
      <div #loadMoreExec></div>
    </div>
  `,
    styles: []
})
export class WebServiceExecuteListComponent implements OnInit, AfterViewInit, OnDestroy {
    private service = inject(WebServiceConfigService);
    @ViewChild('loadMoreExec') loadMoreExecRef!: ElementRef<HTMLDivElement>;
    private execObserver?: IntersectionObserver;

    private readonly pageSize = 25;

    execLoading = signal(false);
    execData = signal<WebServiceEjecucionDTO[]>([]);
    execCurrentPage = signal(0);
    execHasMore = signal(true);
    execFilter: WebServiceEjecucionFilterDTO = { servicio: '', usuario: '', fechaEjecucionMin: undefined, fechaEjecucionMax: undefined, documento: '', modificador: '', transaccion: '', entrada: '', salida: '', masivo: '', textoRespuesta: '', sincrona: '', paginacionRegistroInicial: 0, paginacionRegistroFinal: 25, filtroParametro: '', llaveTabla: '', estado: 'A' };
    execDisplayedColumns = ['servicio', 'usuario', 'fechaEjecucion', 'entrada', 'salida', 'error', 'sincrona'];

    datesValid(): boolean {
        return !!(this.execFilter.fechaEjecucionMin && this.execFilter.fechaEjecucionMax);
    }

    ngOnInit(): void {}

    ngAfterViewInit(): void {
        this.execObserver = new IntersectionObserver((entries) => { if (entries.some(e => e.isIntersecting)) this.loadExecNext(); });
        this.execObserver.observe(this.loadMoreExecRef.nativeElement);
    }

    ngOnDestroy(): void {
        this.execObserver?.disconnect();
    }

    loadExecNext(): void {
        if (!this.datesValid()) return;
        if (this.execLoading() || !this.execHasMore()) return;
        this.execLoading.set(true);
        const f = this.execFilter;
        f.paginacionRegistroInicial = this.execCurrentPage() * this.pageSize;
        f.paginacionRegistroFinal = this.pageSize;
        this.service.getExecutions(f).subscribe({
            next: (res) => { this.execData.update(items => [...items, ...res]); this.execCurrentPage.update(p => p + 1); if (res.length < this.pageSize) this.execHasMore.set(false); this.execLoading.set(false); this.checkExecMore(); },
            error: () => this.execLoading.set(false)
        });
    }

    private checkExecMore(): void {
        requestAnimationFrame(() => {
            if (this.execLoading() || !this.execHasMore() || this.execData().length === 0) return;
            const rect = this.loadMoreExecRef.nativeElement.getBoundingClientRect();
            if (rect.top < window.innerHeight) this.loadExecNext();
        });
    }

    reload(): void {
        this.execCurrentPage.set(0);
        this.execHasMore.set(true);
        this.execData.set([]);
        if (this.datesValid()) {
            this.loadExecNext();
        }
    }

    onExecFilterChange(): void { this.reload(); }
}
