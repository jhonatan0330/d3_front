import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { DropdownComponent } from 'app/shared/components/dropdown/dropdown.component';
import { DropdownItemComponent } from 'app/shared/components/dropdown/dropdown-item.component';
import { MensajeDTO, MensajeFilterDTO } from 'app/document/document.types';
import { MessageService } from '../configuracion.api';
import { MessageDetailComponent } from './message-detail.component';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-message-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatDatepickerModule,
        MatNativeDateModule,
        DropdownComponent,
        DropdownItemComponent
    ],
    template: `
    <div class="p-4 sm:p-6 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Mensajes</h1>
      </div>

      <!-- Filtros -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Fecha Mínima *</mat-label>
            <input matInput [matDatepicker]="dp1" [(ngModel)]="msgFilter.fechaMin" (ngModelChange)="onMsgFilterChange()" placeholder="DD/MM/YYYY" required />
            <mat-datepicker-toggle matIconSuffix [for]="dp1"></mat-datepicker-toggle>
            <mat-datepicker #dp1></mat-datepicker>
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Fecha Máxima *</mat-label>
            <input matInput [matDatepicker]="dp2" [(ngModel)]="msgFilter.fechaMax" (ngModelChange)="onMsgFilterChange()" placeholder="DD/MM/YYYY" required />
            <mat-datepicker-toggle matIconSuffix [for]="dp2"></mat-datepicker-toggle>
            <mat-datepicker #dp2></mat-datepicker>
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Título</mat-label>
            <input matInput [(ngModel)]="msgFilter.titulo" (ngModelChange)="onMsgFilterChange()" placeholder="Buscar por título" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Usuario</mat-label>
            <input matInput [(ngModel)]="msgFilter.usuario" (ngModelChange)="onMsgFilterChange()" placeholder="Filtrar por usuario" />
          </mat-form-field>
          <div></div>
        </div>
      </div>

      <!-- Lista Mensajes -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        @if (!datesValid()) {
          <div class="p-6 text-center text-amber-600 dark:text-amber-400 text-sm font-medium">
            <mat-icon class="align-middle mr-1">warning</mat-icon>
            Debe seleccionar las fechas Desde y Hasta para consultar los mensajes.
          </div>
        } @else {
          @if (msgLoading() && msgData().length === 0) {
            <div class="flex justify-center py-12"><div class="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden"><div class="h-full bg-primary rounded animate-pulse" style="width: 40%;"></div></div></div>
          } @else {
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              @for (element of msgData(); track element.llaveTabla) {
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 p-4 flex flex-col gap-3">
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex items-center gap-3 min-w-0 cursor-pointer rounded-lg p-1 -m-1 transition hover:bg-gray-900/5 dark:hover:bg-white/10" (click)="openMessageDetail(element)">
                      <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <mat-icon class="text-primary">email</mat-icon>
                      </div>
                      <div class="min-w-0">
                        <p class="text-xs font-mono text-gray-500 dark:text-gray-400">{{ element.documento }}</p>
                        <h3 class="font-semibold text-gray-900 dark:text-gray-100 truncate">{{ element.titulo }}</h3>
                      </div>
                    </div>
                    <app-dropdown>
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
                </div>
              }
            </div>
            <div class="px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between gap-4">
              <span class="text-sm text-gray-500 dark:text-gray-400">Mostrando {{ msgData().length }} registros</span>
              @if (msgLoading()) { <div class="w-40 h-1 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden"><div class="h-full bg-primary rounded animate-pulse" style="width: 40%;"></div></div> }
            </div>
          }
          @if (!msgLoading() && msgData().length === 0) { <div class="text-center py-12 text-gray-500 dark:text-gray-400">No hay mensajes en el rango seleccionado</div> }
        }
      </div>
      <div #loadMoreMsg></div>
    </div>
  `,
    styles: []
})
export class MessageListComponent implements OnInit, AfterViewInit, OnDestroy {
    private messageService = inject(MessageService);
    private dialog = inject(MatDialog);
    @ViewChild('loadMoreMsg') loadMoreMsgRef!: ElementRef<HTMLDivElement>;
    private msgObserver?: IntersectionObserver;

    private readonly pageSize = 25;

    msgLoading = signal(false);
    msgData = signal<MensajeDTO[]>([]);
    msgCurrentPage = signal(0);
    msgHasMore = signal(true);
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

    datesValid(): boolean {
        return !!(this.msgFilter.fechaMin && this.msgFilter.fechaMax);
    }

    ngOnInit(): void {}

    ngAfterViewInit(): void {
        this.msgObserver = new IntersectionObserver((entries) => { if (entries.some(e => e.isIntersecting)) this.loadMsgNext(); });
        this.msgObserver.observe(this.loadMoreMsgRef.nativeElement);
    }

    ngOnDestroy(): void {
        this.msgObserver?.disconnect();
    }

    loadMsgNext(): void {
        if (!this.datesValid()) return;
        if (this.msgLoading() || !this.msgHasMore()) return;
        this.msgLoading.set(true);
        const f = this.msgFilter;
        f.paginacionRegistroInicial = this.msgCurrentPage() * this.pageSize;
        f.paginacionRegistroFinal = this.pageSize;
        this.messageService.getMessages(f).subscribe({
            next: (res) => { this.msgData.update(items => [...items, ...res]); this.msgCurrentPage.update(p => p + 1); if (res.length < this.pageSize) this.msgHasMore.set(false); this.msgLoading.set(false); this.checkMsgMore(); },
            error: () => this.msgLoading.set(false)
        });
    }

    private checkMsgMore(): void {
        requestAnimationFrame(() => {
            if (this.msgLoading() || !this.msgHasMore() || this.msgData().length === 0) return;
            const rect = this.loadMoreMsgRef.nativeElement.getBoundingClientRect();
            if (rect.top < window.innerHeight) this.loadMsgNext();
        });
    }

    onMsgFilterChange(): void { this.reload(); }

    reload(): void {
        this.msgCurrentPage.set(0);
        this.msgHasMore.set(true);
        this.msgData.set([]);
        if (this.datesValid()) {
            this.loadMsgNext();
        }
    }

    getAttachmentCount(urls: string): number {
        return urls.split(/[;,\n]/).filter(u => u.trim().length > 0).length;
    }

    openMessageDetail(msg: MensajeDTO): void {
        this.dialog.open(MessageDetailComponent, {
            width: '800px', maxWidth: '90vw', maxHeight: '90vh', disableClose: true,
            data: msg
        });
    }

    openAttachments(msg: MensajeDTO): void {
        this.dialog.open(MessageDetailComponent, {
            width: '800px', maxWidth: '90vw', maxHeight: '90vh', disableClose: true,
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
                    next: () => { Swal.fire('Éxito', 'Mensaje reenviado correctamente', 'success'); this.reload(); },
                    error: () => Swal.fire('Error', 'No se pudo reenviar el mensaje', 'error')
                });
            }
        });
    }
}
