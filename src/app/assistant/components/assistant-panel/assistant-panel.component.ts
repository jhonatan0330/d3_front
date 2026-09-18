import { AfterViewInit, ChangeDetectionStrategy, Component, DestroyRef, ElementRef, HostListener, inject, OnInit, signal, ViewChild } from '@angular/core';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PedidoVentaDTO } from 'app/document/document.types';
import { LoginService } from 'app/authentication/login.service';
import { AssistantService } from 'app/assistant/business/assistant.service';
import { AssistantMessage, AssistantState, CreateDocumentAction, DocumentSearchResult, TemplateSearchResult } from 'app/assistant/domain/assistant.models';


@Component({
    selector: 'app-assistant-panel',
    standalone: true,
    imports: [FormsModule, MatIconModule, MatFormFieldModule, MatInputModule, RouterModule],
    templateUrl: './assistant-panel.component.html',
    styleUrl: './assistant-panel.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssistantPanelComponent implements OnInit, AfterViewInit {
    isDarkMode = false;
    @ViewChild('messagesContainer') private messagesContainer!: ElementRef<HTMLDivElement>;
    @ViewChild('messageInput', { read: MatInput }) private messageInput!: MatInput;
    private readonly assistantService = inject(AssistantService);
    private readonly destroyRef = inject(DestroyRef);
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

        if (intent.tipo === 'vacio') { return; }

        this.assistantService.ejecutar(intent)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: resultado => {
                    this.estado.set(resultado.state);
                    if (resultado.message.text) {
                        this.agregarMensaje(resultado.message);
                    }
                    if (resultado.close) {
                        this.cerrar();
                    }
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


    ejecutarDocumento(doc: DocumentSearchResult): void {
        if (doc.plantilla) {
            const pedidoVenta: PedidoVentaDTO = new PedidoVentaDTO();
            pedidoVenta.llaveTabla = doc.llaveTabla;
            pedidoVenta.plantilla = doc.plantilla;
            this.assistantService.abrirDocumento(pedidoVenta);
        }

        this.agregarMensaje({
            id: crypto.randomUUID(),
            type: 'assistant',
            text: 'Documento abierto',
            date: new Date(),
        });
        this.cerrar();
    }

    ejecutarPlantilla(template: TemplateSearchResult): void {
        this.assistantService.abrirTemplateDirect(template.llaveTabla)
        this.agregarMensaje({
            id: crypto.randomUUID(),
            type: 'assistant',
            text: 'Plantilla abierta',
            date: new Date(),
        });
        this.cerrar();
    }

    ejecutarAccion(action: CreateDocumentAction): void {
        this.assistantService.abrirAccionDocumento(action);
        this.agregarMensaje({
            id: crypto.randomUUID(),
            type: 'assistant',
            text: 'Formulario preparado para revisión.',
            date: new Date(),
        });
        this.cerrar();
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
        this.assistantService.closePanel();
    }

    @HostListener('document:keydown', ['$event'])
    onKeydown(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            event.preventDefault();
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