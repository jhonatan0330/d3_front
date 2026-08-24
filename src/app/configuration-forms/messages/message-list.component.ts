import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MensajeDTO, MensajeFilterDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { MessageService } from './message.service';
import { MessageDetailComponent } from './message-detail.component';
import { AttachmentViewerComponent } from '../shared/attachment-viewer.component';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-message-list',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule, MatButtonModule, MatTableModule, MatPaginatorModule, MatInputModule, MatFormFieldModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule, AttachmentViewerComponent],
    template: `
    <div class="p-4 sm:p-6 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Mensajes</h1>
      </div>

      <!-- Filtros -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Título</mat-label>
            <input matInput [(ngModel)]="filter.titulo" (ngModelChange)="onFilterChange()" placeholder="Buscar por título" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Usuario</mat-label>
            <input matInput [(ngModel)]="filter.usuario" (ngModelChange)="onFilterChange()" placeholder="Filtrar por usuario" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Estado Envío</mat-label>
            <mat-select [(ngModel)]="filter.enviado" (ngModelChange)="onFilterChange()">
              <mat-option value="">Todos</mat-option>
              <mat-option value="enviado">Enviado</mat-option>
              <mat-option value="pendiente">Pendiente</mat-option>
              <mat-option value="error">Error</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Fecha Desde</mat-label>
            <input matInput [matDatepicker]="dp1" [(ngModel)]="filter.fechaDesde" (ngModelChange)="onFilterChange()" placeholder="DD/MM/YYYY" />
            <mat-datepicker-toggle matIconSuffix [for]="dp1"></mat-datepicker-toggle>
            <mat-datepicker #dp1></mat-datepicker>
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Fecha Hasta</mat-label>
            <input matInput [matDatepicker]="dp2" [(ngModel)]="filter.fechaHasta" (ngModelChange)="onFilterChange()" placeholder="DD/MM/YYYY" />
            <mat-datepicker-toggle matIconSuffix [for]="dp2"></mat-datepicker-toggle>
            <mat-datepicker #dp2></mat-datepicker>
          </mat-form-field>
        </div>
      </div>

      <!-- Tabla -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        @if (loading()) { <div class="flex justify-center py-12"><mat-spinner diameter="40"></mat-spinner></div> } @else {
          <div class="overflow-x-auto">
            <table mat-table [dataSource]="data()" class="w-full">
              <ng-container matColumnDef="fecha">
                <th mat-header-cell class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Fecha</th>
                <td mat-cell class="px-4 py-3 whitespace-nowrap">{{ element.fecha | date:'dd/MM/yyyy HH:mm' }}</td>
              </ng-container>
              <ng-container matColumnDef="titulo">
                <th mat-header-cell class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Título</th>
                <td mat-cell class="px-4 py-3 font-medium cursor-pointer hover:underline" (click)="openDetail(element)">{{ element.titulo }}</td>
              </ng-container>
              <ng-container matColumnDef="usuario">
                <th mat-header-cell class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Usuario</th>
                <td mat-cell class="px-4 py-3">{{ element.usuario }}</td>
              </ng-container>
              <ng-container matColumnDef="estadoEnvio">
                <th mat-header-cell class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Estado</th>
                <td mat-cell class="px-4 py-3">
                  <span class="badge" [class]="getEnvioBadge(element)">
                    {{ getEnvioLabel(element) }}
                  </span>
                </td>
              </ng-container>
              <ng-container matColumnDef="adjuntos">
                <th mat-header-cell class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Adjuntos</th>
                <td mat-cell class="px-4 py-3">
                  @if (element.adjuntoURL) {
                    <button type="button" class="btn-icon" (click)="openAttachments(element)" aria-label="Ver adjuntos" title="Ver adjuntos">
                      <mat-icon>attach_file</mat-icon>
                      <span class="hidden sm:inline ml-1">{{ getAttachmentCount(element.adjuntoURL) }}</span>
                    </button>
                  } @else {
                    <span class="text-gray-400 text-sm">—</span>
                  }
                </td>
              </ng-container>
              <ng-container matColumnDef="acciones">
                <th mat-header-cell class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Acciones</th>
                <td mat-cell class="px-4 py-3">
                  <div class="flex items-center justify-end gap-1">
                    <button type="button" class="btn-icon" (click)="openDetail(element)" aria-label="Ver detalle"><mat-icon>visibility</mat-icon></button>
                    @if (!element.correoEnviado || element.correoError) {
                      <button type="button" class="btn-icon" (click)="resendMessage(element)" aria-label="Reenviar" title="Reenviar" matTooltip="Reenviar">
                        <mat-icon>send</mat-icon>
                      </button>
                    }
                  </div>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>
          <mat-paginator [length]="totalItems()" [pageSize]="pageSize()" [pageSizeOptions]="[10, 25, 50, 100]" (page)="onPageChange($event)" class="px-4 py-2 border-t border-gray-200 dark:border-gray-700"></mat-paginator>
        }
        @if (!loading() && data().length === 0) { <div class="text-center py-12 text-gray-500 dark:text-gray-400">No hay mensajes registrados</div> }
      </div>
    </div>
  `,
    styles: [`
    .btn-icon { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 50%; border: none; background: transparent; color: #666; cursor: pointer; }
    .btn-icon:hover { background: #f5f5f5; color: #333; }
    .badge { padding: 0.125rem 0.5rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 500; }
    .badge-success { background: #e8f5e9; color: #2e7d32; }
    .badge-warning { background: #fff3e0; color: #ef6c00; }
    .badge-error { background: #fce4ec; color: #c62828; }
    .badge-secondary { background: #f5f5f5; color: #757575; }
    :host ::ng-deep .mat-form-field { width: 100%; }
    :host ::ng-deep .mat-column-acciones { width: 120px; text-align: right; }
    :host ::ng-deep .mat-column-adjuntos { width: 100px; text-align: center; }
    :host ::ng-deep .mat-column-estadoEnvio { width: 130px; }
  `]
})
export class MessageListComponent implements OnInit {
    private service = inject(MessageService);
    private dialog = inject(MatDialog);

    loading = signal(false);
    data = signal<MensajeDTO[]>([]);
    totalItems = signal(0);
    pageSize = signal(25);
    currentPage = signal(0);

    filter = signal<MensajeFilterDTO>({
        estado: 'A',
        fechaDesde: undefined,
        fechaHasta: undefined,
        enviado: '',
        usuario: '',
        titulo: '',
        paginacionRegistroInicial: 0,
        paginacionRegistroFinal: 25
    });

    displayedColumns = ['fecha', 'titulo', 'usuario', 'estadoEnvio', 'adjuntos', 'acciones'];

    ngOnInit(): void { this.loadData(); }

    loadData(): void {
        this.loading.set(true);
        const f = this.filter();
        f.paginacionRegistroInicial = this.currentPage() * this.pageSize();
        f.paginacionRegistroFinal = f.paginacionRegistroInicial + this.pageSize();

        this.service.getMessages(f).subscribe({
            next: (res) => { this.data.set(res); this.totalItems.set(res.length); this.loading.set(false); },
            error: () => this.loading.set(false)
        });
    }

    onFilterChange(): void { this.currentPage.set(0); this.loadData(); }
    onPageChange(event: PageEvent): void { this.currentPage.set(event.pageIndex); this.pageSize.set(event.pageSize); this.loadData(); }

    getEnvioLabel(msg: MensajeDTO): string {
        if (msg.correoError) return 'Error';
        if (msg.correoEnviado) return 'Enviado';
        return 'Pendiente';
    }

    getEnvioBadge(msg: MensajeDTO): string {
        if (msg.correoError) return 'badge-error';
        if (msg.correoEnviado) return 'badge-success';
        return 'badge-warning';
    }

    getAttachmentCount(urls: string): number {
        return urls.split(/[;,\n]/).filter(u => u.trim().length > 0).length;
    }

    openDetail(msg: MensajeDTO): void {
        this.dialog.open(MessageDetailComponent, {
            width: '800px', maxWidth: '90vw', maxHeight: '90vh',
            data: msg
        });
    }

    openAttachments(msg: MensajeDTO): void {
        this.dialog.open(MessageDetailComponent, {
            width: '800px', maxWidth: '90vw', maxHeight: '90vh',
            data: { ...msg, _showAttachments: true }
        });
    }

    resendMessage(msg: MensajeDTO): void {
        Swal.fire({
            title: '¿Reenviar mensaje?',
            text: 'Se intentará enviar nuevamente el mensaje.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, reenviar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.service.resendMessage(msg.llaveTabla).subscribe({
                    next: (updated) => {
                        Swal.fire('Éxito', 'Mensaje reenviado correctamente', 'success');
                        this.loadData();
                    },
                    error: () => Swal.fire('Error', 'No se pudo reenviar el mensaje', 'error')
                });
            }
        });
    }
}