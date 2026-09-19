import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { DropdownComponent } from 'app/shared/components/dropdown/dropdown/dropdown.component';
import { DropdownItemComponent } from 'app/shared/components/dropdown/dropdown-item/dropdown-item.component';
import { MensajeDTO, MensajeFilterDTO } from 'app/document/document.types';
import { MessageService } from 'app/configuration/configuracion.api';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';
import { MessageDetailComponent } from '../message-detail/message-detail.component';

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
    templateUrl: './message-list.component.html',
})
export class MessageListComponent implements OnInit, AfterViewInit, OnDestroy {
    private notificationCenter = inject(NotificationCenterService);
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
        llaveTabla: ''
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
        this.notificationCenter.fire({
            title: '¿Reenviar mensaje?',
            text: 'Se intentará enviar nuevamente el mensaje.',
            icon: 'question', showCancelButton: true,
            confirmButtonText: 'Sí, reenviar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.messageService.resendMessage(msg.llaveTabla).subscribe({
                    next: () => { this.notificationCenter.fire('Éxito', 'Mensaje reenviado correctamente', 'success'); this.reload(); },
                    error: () => this.notificationCenter.fire('Error', 'No se pudo reenviar el mensaje', 'error')
                });
            }
        });
    }
}
