import { AfterViewInit, ChangeDetectionStrategy, Component, DestroyRef, ElementRef, HostListener, inject, OnInit, signal, ViewChild } from '@angular/core';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogRef } from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AssistantMessage, AssistantState, TemplateData, } from '../assistant.models';
import { AssistantService, } from '../assistant.service';
import { UtilsService } from 'app/modules/full/neuron/service/utils.service';
import { PedidoVentaDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { ImageFormatPipe } from '../../shared/local-image';
import { LoginService } from 'app/authentication/login.service';


@Component({
    selector: 'app-assistant-dialog',
    standalone: true,
    imports: [FormsModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, ImageFormatPipe],
    templateUrl: './assistant-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssistantDialogComponent implements OnInit, AfterViewInit {
    isDarkMode = false;
    @ViewChild('messagesContainer') private messagesContainer!: ElementRef<HTMLDivElement>;
    @ViewChild('messageInput', { read: MatInput }) private messageInput!: MatInput;
    private readonly dialogRef = inject(MatDialogRef<AssistantDialogComponent>);
    private readonly assistantService = inject(AssistantService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly utilsService = inject(UtilsService);
    private readonly jwtAuth = inject(LoginService);
    imagenUsuario = signal<string>('');
    readonly estado = signal<AssistantState>('idle');
    pregunta = '';

    private readonly animaciones: Record<AssistantState, string> = {
        idle: 'assets/images/assistant.gif',
        listening: 'assets/images/assistant.gif',
        thinking: 'assets/images/assistant.gif',
        searching: 'assets/images/assistant.gif',
        success: 'assets/images/assistant.gif',
        error: 'assets/images/assistant.gif',
    };

    ngOnInit(): void {
        this.assistantService.isOpenDialog.set(false);
        this.isDarkMode = document.body.classList.contains('dark');
        this.imagenUsuario.set(this.jwtAuth.user()?.imagen ?? '');
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.messageInput?.focus();
            this.scrollToBottom();
        });
    }

    get mensajes() {
        return this.assistantService.mensajes;
    }

    get imagenAssistant(): string {
        return this.animaciones[this.estado()];
    }

    enviar(): void {
        const texto = this.pregunta.trim();
        if (!texto) { return; }

        this.agregarMensaje({
            id: crypto.randomUUID(),
            type: 'user',
            text: texto,
            date: new Date(),
        });
        this.pregunta = '';
        this.estado.set('thinking');

        const intent = this.assistantService.interpretar(texto);

        if (intent.tipo === 'buscar-documento') {
            this.estado.set('searching');
        }

        this.assistantService.ejecutar(intent)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: resultado => {
                    this.estado.set(resultado.state);
                    this.agregarMensaje(resultado.message);
                },
                error: () => {
                    this.estado.set('error');
                    this.agregarMensaje({
                        id: crypto.randomUUID(),
                        type: 'assistant',
                        text: 'Ocurrió un error procesando tu solicitud.',
                        date: new Date(),
                    });
                },
            });
    }

    ejecutarAccion(actionId: string, message: AssistantMessage): void {
        switch (actionId) {
            case 'abrir-template':
                this.abrirTemplate(message);
                break;
        }
    }

    private abrirTemplate(message: AssistantMessage): void {
        const data = message.data as TemplateData;
        if (!data || !data.llaveTabla) {
            return;
        }
        const pedidoVenta: PedidoVentaDTO = new PedidoVentaDTO();
        pedidoVenta.plantilla = data.llaveTabla;
        if (data.server) {
            pedidoVenta.server = data.server;
        }
        const esReporte = data.tipo === 'Report';
        this.utilsService.modalWithParams(pedidoVenta, esReporte);
    }

    private agregarMensaje(mensaje: AssistantMessage): void {
        this.assistantService.agregarMensaje(mensaje);
        setTimeout(() => this.scrollToBottom());
    }

    scrollToBottom(): void {
        const el = this.messagesContainer?.nativeElement;
        if (el) {
            el.scrollTop = el.scrollHeight;
        }
    }

    formatTime(date: Date): string {
        return date.toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    cerrar(): void {
        this.assistantService.isOpenDialog.set(true);
        this.dialogRef.close();
    }

    @HostListener('document:keydown', ['$event'])
    onKeydown(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            this.cerrar();
        }
    }

    toggleScheme(): void {
        const isDark = document.body.classList.contains('dark');
        document.body.classList.remove('dark', 'light');
        document.body.classList.add(isDark ? 'light' : 'dark');
        this.isDarkMode = !isDark;
    }
}
