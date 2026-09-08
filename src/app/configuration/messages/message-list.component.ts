import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { DropdownComponent } from 'app/shared/components/dropdown/dropdown.component';
import { DropdownItemComponent } from 'app/shared/components/dropdown/dropdown-item.component';
import { MensajeDTO, MensajeFilterDTO, MensajePlantillaCorreoDTO, MensajePlantillaCorreoFilterDTO } from 'app/document/document.types';
import { MessageService, MessageTemplateService } from '../configuracion.api';
import { MessageDetailComponent } from './message-detail.component';
import { MessageTemplateFormComponent } from '../message-templates/message-template-form.component';
import { AttachmentViewerComponent } from '../shared/attachment-viewer.component';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-message-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatIconModule,
        MatTableModule,
        MatPaginatorModule,
        MatInputModule,
        MatFormFieldModule,
        MatTabsModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        DropdownComponent,
        DropdownItemComponent
    ],
    template: `
    <div class="p-4 sm:p-6 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Mensajes</h1>
        @if (activeTab() === 0) {
          <button type="button" class="btn-flat-primary" (click)="openTemplateForm()">
            <mat-icon>add</mat-icon>
            Nueva Plantilla
          </button>
        }
      </div>

      <!-- Filtros -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
        @if (activeTab() === 0) {
          <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Nombre</mat-label>
              <input matInput [(ngModel)]="tplFilter.nombre" (ngModelChange)="onTplFilterChange()" placeholder="Filtrar por nombre" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Servidor</mat-label>
              <input matInput [(ngModel)]="tplFilter.servidor" (ngModelChange)="onTplFilterChange()" placeholder="Filtrar por servidor" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Estado</mat-label>
              <mat-select [(ngModel)]="tplFilter.estado" (ngModelChange)="onTplFilterChange()">
                <mat-option value="A">Activo</mat-option>
                <mat-option value="I">Inactivo</mat-option>
                <mat-option value="">Todos</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Título</mat-label>
              <input matInput [(ngModel)]="msgFilter.titulo" (ngModelChange)="onMsgFilterChange()" placeholder="Buscar por título" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Usuario</mat-label>
              <input matInput [(ngModel)]="msgFilter.usuario" (ngModelChange)="onMsgFilterChange()" placeholder="Filtrar por usuario" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Fecha Mínima</mat-label>
              <input matInput [matDatepicker]="dp1" [(ngModel)]="msgFilter.fechaMin" (ngModelChange)="onMsgFilterChange()" placeholder="DD/MM/YYYY" />
              <mat-datepicker-toggle matIconSuffix [for]="dp1"></mat-datepicker-toggle>
              <mat-datepicker #dp1></mat-datepicker>
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Fecha Máxima</mat-label>
              <input matInput [matDatepicker]="dp2" [(ngModel)]="msgFilter.fechaMax" (ngModelChange)="onMsgFilterChange()" placeholder="DD/MM/YYYY" />
              <mat-datepicker-toggle matIconSuffix [for]="dp2"></mat-datepicker-toggle>
              <mat-datepicker #dp2></mat-datepicker>
            </mat-form-field>
          </div>
        }
      </div>

      <!-- Tabs: Plantillas | Mensajes -->
      <mat-tab-group [selectedIndex]="activeTab()" (selectedIndexChange)="activeTab.set($event)" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <mat-tab label="Plantillas">
          <div class="p-4">
            @if (tplLoading()) {
              <div class="flex justify-center py-12"><div class="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden"><div class="h-full bg-primary rounded animate-pulse" style="width: 40%;"></div></div></div>
            } @else {
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                @for (element of tplData(); track element.llaveTabla) {
                  <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 p-4 flex flex-col gap-3">
                    <div class="flex items-start justify-between gap-2">
                      <div class="flex items-center gap-3 min-w-0">
                        <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <mat-icon class="text-primary">mail</mat-icon>
                        </div>
                        <div class="min-w-0">
                          <p class="text-xs font-mono text-gray-500 dark:text-gray-400">{{ element.nombre }}</p>
                          <h3 class="font-semibold text-gray-900 dark:text-gray-100 truncate">{{ element.titulo }}</h3>
                        </div>
                      </div>
                      <app-dropdown>
                        <button type="button" class="btn-icon" trigger aria-label="Acciones"><mat-icon>more_vert</mat-icon></button>
                        <app-dropdown-item (clicked)="openTemplateForm(element)"><mat-icon class="text-base">edit</mat-icon> Editar</app-dropdown-item>
                        <app-dropdown-item (clicked)="toggleTemplateStatus(element)"><mat-icon class="text-base">{{ element.estado === 'A' ? 'block' : 'check_circle' }}</mat-icon> {{ element.estado === 'A' ? 'Inactivar' : 'Activar' }}</app-dropdown-item>
                      </app-dropdown>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">{{ element.texto }}</p>
                    <dl class="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <dt class="text-xs text-gray-500 dark:text-gray-400">Servidor</dt>
                        <dd class="text-gray-900 dark:text-gray-100 truncate">{{ element.servidor || 'Ninguno' }}</dd>
                      </div>
                    </dl>
                    <div class="mt-auto">
                      <span class="badge" [class.badge-success]="element.estado === 'A'" [class.badge-secondary]="element.estado === 'I'">{{ element.estado === 'A' ? 'Activo' : 'Inactivo' }}</span>
                    </div>
                  </div>
                }
              </div>
              @if (tplData().length === 0) { <div class="text-center py-12 text-gray-500 dark:text-gray-400">No hay plantillas registradas</div> }
              <mat-paginator [length]="tplTotalItems()" [pageSize]="tplPageSize()" [pageSizeOptions]="[10, 25, 50, 100]" (page)="onTplPageChange($event)" class="px-4 py-2 border-t border-gray-200 dark:border-gray-700"></mat-paginator>
            }
          </div>
        </mat-tab>

        <mat-tab label="Mensajes">
          <div class="p-4">
            @if (msgLoading()) {
              <div class="flex justify-center py-12"><div class="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden"><div class="h-full bg-primary rounded animate-pulse" style="width: 40%;"></div></div></div>
            } @else {
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                @for (element of msgData(); track element.llaveTabla) {
                  <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 p-4 flex flex-col gap-3 cursor-pointer" (click)="openMessageDetail(element)">
                    <div class="flex items-start justify-between gap-2">
                      <div class="flex items-center gap-3 min-w-0">
                        <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <mat-icon class="text-primary">mail</mat-icon>
                        </div>
                        <div class="min-w-0">
                          <p class="text-xs text-gray-500 dark:text-gray-400">{{ element.fecha | date:'dd/MM/yyyy HH:mm' }}</p>
                          <h3 class="font-semibold text-gray-900 dark:text-gray-100 truncate">{{ element.titulo }}</h3>
                          <p class="text-sm text-gray-500 dark:text-gray-400 truncate">{{ element.usuario }}</p>
                        </div>
                      </div>
                      <app-dropdown (click)="prevent($event)">
                        <button type="button" class="btn-icon" trigger aria-label="Acciones"><mat-icon>more_vert</mat-icon></button>
                        <app-dropdown-item (clicked)="openMessageDetail(element)"><mat-icon class="text-base">visibility</mat-icon> Ver detalle</app-dropdown-item>
                        @if (element.adjuntoURL) {
                          <app-dropdown-item (clicked)="openAttachments(element)"><mat-icon class="text-base">attach_file</mat-icon> Adjuntos ({{ getAttachmentCount(element.adjuntoURL) }})</app-dropdown-item>
                        }
                        @if (!element.correoEnviado || element.correoError) {
                          <app-dropdown-item (clicked)="resendMessage(element)"><mat-icon class="text-base">send</mat-icon> Reenviar</app-dropdown-item>
                        }
                      </app-dropdown>
                    </div>
                    <div class="mt-auto flex items-center gap-2">
                      <span class="badge" [class]="getEnvioBadge(element)">{{ getEnvioLabel(element) }}</span>
                      @if (element.adjuntoURL) {
                        <button type="button" class="btn-icon" (click)="openAttachments(element); prevent($event)" aria-label="Ver adjuntos" title="Ver adjuntos">
                          <mat-icon>attach_file</mat-icon>
                          <span class="hidden sm:inline ml-1">{{ getAttachmentCount(element.adjuntoURL) }}</span>
                        </button>
                      }
                    </div>
                  </div>
                }
              </div>
              @if (msgData().length === 0) { <div class="text-center py-12 text-gray-500 dark:text-gray-400">No hay mensajes registrados</div> }
              <mat-paginator [length]="msgTotalItems()" [pageSize]="msgPageSize()" [pageSizeOptions]="[10, 25, 50, 100]" (page)="onMsgPageChange($event)" class="px-4 py-2 border-t border-gray-200 dark:border-gray-700"></mat-paginator>
            }
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
    styles: []
})
export class MessageListComponent implements OnInit {
    private messageService = inject(MessageService);
    private templateService = inject(MessageTemplateService);
    private dialog = inject(MatDialog);

    activeTab = signal(0);

    // Plantillas (Tab 0)
    tplLoading = signal(false);
    tplData = signal<MensajePlantillaCorreoDTO[]>([]);
    tplTotalItems = signal(0);
    tplPageSize = signal(25);
    tplCurrentPage = signal(0);
    tplFilter: MensajePlantillaCorreoFilterDTO = {
        estado: 'A',
        nombre: '',
        servidor: '',
        paginacionRegistroInicial: 0,
        paginacionRegistroFinal: 25,
        filtroParametro: '',
        llaveTabla: '',
        securityToken: ''
    };

    // Mensajes (Tab 1)
    msgLoading = signal(false);
    msgData = signal<MensajeDTO[]>([]);
    msgTotalItems = signal(0);
    msgPageSize = signal(25);
    msgCurrentPage = signal(0);
    msgFilter: MensajeFilterDTO = {
        estado: 'A',
        fechaMin: undefined,
        fechaMax: undefined,
        usuario: '',
        titulo: '',
        documento: '',
        template: '',
        adjuntoURL: '',
        reporte: '',
        transaccion: '',
        paginacionRegistroInicial: 0,
        paginacionRegistroFinal: 25,
        filtroParametro: '',
        llaveTabla: '',
        securityToken: ''
    };

    ngOnInit(): void {
        this.loadTemplates();
    }

    // ── Plantillas ──

    loadTemplates(): void {
        this.tplLoading.set(true);
        const f = this.tplFilter;
        f.paginacionRegistroInicial = this.tplCurrentPage() * this.tplPageSize();
        f.paginacionRegistroFinal = f.paginacionRegistroInicial + this.tplPageSize();

        this.templateService.getTemplates(f).subscribe({
            next: (res) => { this.tplData.set(res); this.tplTotalItems.set(res.length); this.tplLoading.set(false); },
            error: () => this.tplLoading.set(false)
        });
    }

    onTplFilterChange(): void { this.tplCurrentPage.set(0); this.loadTemplates(); }
    onTplPageChange(event: PageEvent): void { this.tplCurrentPage.set(event.pageIndex); this.tplPageSize.set(event.pageSize); this.loadTemplates(); }

    openTemplateForm(item?: MensajePlantillaCorreoDTO): void {
        const dialogRef = this.dialog.open(MessageTemplateFormComponent, {
            width: '800px', maxWidth: '90vw',
            data: item ? { ...item } : null
        });
        dialogRef.afterClosed().subscribe((result: MensajePlantillaCorreoDTO) => { if (result) this.loadTemplates(); });
    }

    toggleTemplateStatus(item: MensajePlantillaCorreoDTO): void {
        const newEstado = item.estado === 'A' ? 'I' : 'A';
        const action = newEstado === 'A' ? 'activar' : 'inactivar';
        Swal.fire({
            title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} plantilla?`,
            icon: 'question', showCancelButton: true,
            confirmButtonText: 'Sí', cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                const updated = { ...item, estado: newEstado };
                this.templateService.inactivateTemplate(updated).subscribe({
                    next: () => { Swal.fire('Éxito', `Plantilla ${action}da correctamente`, 'success'); this.loadTemplates(); },
                    error: () => Swal.fire('Error', `No se pudo ${action} la plantilla`, 'error')
                });
            }
        });
    }

    // ── Mensajes ──

    loadMessages(): void {
        this.msgLoading.set(true);
        const f = this.msgFilter;
        f.paginacionRegistroInicial = this.msgCurrentPage() * this.msgPageSize();
        f.paginacionRegistroFinal = f.paginacionRegistroInicial + this.msgPageSize();

        this.messageService.getMessages(f).subscribe({
            next: (res) => { this.msgData.set(res); this.msgTotalItems.set(res.length); this.msgLoading.set(false); },
            error: () => this.msgLoading.set(false)
        });
    }

    onMsgFilterChange(): void { this.msgCurrentPage.set(0); this.loadMessages(); }
    onMsgPageChange(event: PageEvent): void { this.msgCurrentPage.set(event.pageIndex); this.msgPageSize.set(event.pageSize); this.loadMessages(); }

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

    prevent(event: Event): void {
        event.stopPropagation();
    }

    openMessageDetail(msg: MensajeDTO): void {
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
            icon: 'question', showCancelButton: true,
            confirmButtonText: 'Sí, reenviar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.messageService.resendMessage(msg.llaveTabla).subscribe({
                    next: () => { Swal.fire('Éxito', 'Mensaje reenviado correctamente', 'success'); this.loadMessages(); },
                    error: () => Swal.fire('Error', 'No se pudo reenviar el mensaje', 'error')
                });
            }
        });
    }
}
