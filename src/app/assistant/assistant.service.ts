import { Injectable, inject, signal } from '@angular/core';
import { Observable, of, delay, switchMap } from 'rxjs';
import { AssistantIntent, AssistantMessage, AssistantResult, ChatMessage, CreateDocumentAction, DocumentActionField, DocumentSearchResult, TemplateSearchResult } from './assistant.models';
import { parseAssistantResponse } from './assistant-response.parser';
import { TemplateService } from 'app/document/service/template.service';
import { DocumentoPlantillaDTO, PedidoVentaCaracteristicaDTO, PedidoVentaDTO, PedidoVentaFilterDTO } from 'app/document/document.types';
import { DocumentoPlantillaTipoEnum } from 'app/document/form/form.enum';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import { ApiService } from 'app/document/document.api';
import { UtilsService } from 'app/document/service/utils.service';
import { Router } from '@angular/router';
import { ChatService } from './chat.service';

@Injectable({ providedIn: 'root' })
export class AssistantService {
    private readonly templateService = inject(TemplateService);
    private readonly api = inject(ApiService);
    private readonly utilsService = inject(UtilsService);
    private router = inject(Router);

    private readonly chatService = inject(ChatService);
    messages: ChatMessage[] = [];

    isOpenPanel = signal<boolean>(false);
    private triggerElement: HTMLElement | null = null;

    togglePanel(): void {
        if (this.isOpenPanel()) {
            this.closePanel();
        } else {
            this.openPanel();
        }
    }

    openPanel(): void {
        this.triggerElement = this.getActiveElement();
        this.isOpenPanel.set(true);
    }

    closePanel(): void {
        this.isOpenPanel.set(false);
        const trigger = this.triggerElement;
        this.triggerElement = null;
        if (trigger) {
            trigger.focus();
        }
    }

    private getActiveElement(): HTMLElement | null {
        const el = document.activeElement as HTMLElement | null;
        return el && typeof el.focus === 'function' ? el : null;
    }

    readonly mensajes = signal<AssistantMessage[]>([
        {
            id: crypto.randomUUID(),
            type: 'assistant',
            text: `Hola \u{1F44B}\uFE0F Soy tu asistente. Estoy aquí para ayudarte a navegar y encontrar información rápidamente. Puedes usar estos pequeños trucos:`,
            date: new Date(),
        },
        {
            id: crypto.randomUUID(),
            type: 'assistant',
            text: `💡 Tip 1 — ¿Necesitas ayuda? ⌨️ En PC: puedes llamarme presionando F9. ❌ Para cerrarme, simplemente presiona Esc. 📱 En celular: toca el ícono de asistente que encontrarás en la esquina inferior derecha.`,
            date: new Date(),
        },
    ]);

    agregarMensaje(mensaje: AssistantMessage): void {
        this.mensajes.update(msgs => [...msgs, mensaje]);
    }

    interpretar(pregunta: string): AssistantIntent {
        const texto = pregunta.trim();

        if (!texto) {
            return {
                tipo: 'vacio',
            };
        }

        const tieneEspacios = /\s/.test(texto);
        const tieneDigitos = /\d/.test(texto);

        if (!tieneEspacios && tieneDigitos) {
            return {
                tipo: 'buscar-por-codigo',
                parametro: texto,
            };
        }

        if (!tieneEspacios && !tieneDigitos) {
            return {
                tipo: 'buscar-modulo',
                parametro: texto,
            };
        }

        return {
            tipo: 'desconocido',
            parametro: texto,
        };
    }

    ejecutar(intent: AssistantIntent): Observable<AssistantResult> {
        switch (intent.tipo) {
            case 'vacio': {
                return of<AssistantResult>({
                    state: 'idle',
                    message: {
                        id: crypto.randomUUID(),
                        type: 'assistant',
                        text: '',
                        date: new Date(),
                    },
                });
            }

            case 'buscar-por-codigo': {
                const filter: PedidoVentaFilterDTO = new PedidoVentaFilterDTO();
                filter.nombre = intent.parametro;
                return this.api.listarDocumentos(filter).pipe(
                    switchMap((docs: PedidoVentaDTO[]) => {
                        if (!docs || docs.length === 0) {
                            return of<AssistantResult>({
                                state: 'success',
                                message: {
                                    id: crypto.randomUUID(),
                                    type: 'assistant',
                                    text: `No se encontraron documentos que se identifiquen como: ${intent.parametro}`,
                                    date: new Date(),
                                },
                            });
                        }
                        const documentos: DocumentSearchResult[] = docs
                            .filter(d => d.estado !== 'I')
                            .map(d => {
                                const template = this.templateService.getTemplate(d.plantilla);
                                return {
                                    llaveTabla: d.llaveTabla,
                                    nombre: d.nombre,
                                    descripcion: d.descripcion,
                                    imagen: d.imagen,
                                    plantilla: template?.llaveTabla,
                                    nombrePlantilla: template?.nombre,
                                };
                            });
                        if (documentos.length === 1) {
                            this.abrirDocumento(docs[0]);
                        }
                        return of<AssistantResult>({
                            state: 'success',
                            close: documentos.length === 1,
                            message: {
                                id: crypto.randomUUID(),
                                type: 'assistant',
                                text: documentos.length === 1
                                    ? 'Documento abierto'
                                    : `Encontré ${documentos.length} documento(s):`,
                                date: new Date(),
                                documents: documentos,
                            },
                        });
                    })
                );
            }

            case 'buscar-modulo': {
                const templates = this.filtrarTemplates(intent.parametro);
                if (templates.length === 0) {
                    return of<AssistantResult>({
                        state: 'success',
                        message: {
                            id: crypto.randomUUID(),
                            type: 'assistant',
                            text: `No se encontraron módulos que coincidan con: ${intent.parametro}`,
                            date: new Date(),
                        },
                    }).pipe(delay(500));
                }
                const templateResults: TemplateSearchResult[] = templates.map(t => ({
                    llaveTabla: t.llaveTabla,
                    nombre: t.nombre,
                    codigo: t.codigo,
                    imagen: t.imagen,
                }));
                if (templateResults.length === 1) {
                    this.abrirTemplateDirect(templates[0].llaveTabla);
                }
                return of<AssistantResult>({
                    state: 'success',
                    close: templateResults.length === 1,
                    message: {
                        id: crypto.randomUUID(),
                        type: 'assistant',
                        text: templateResults.length === 1
                            ? 'Plantilla abierta'
                            : `Encontré ${templateResults.length} plantilla(s):`,
                        date: new Date(),
                        templates: templateResults,
                    },
                }).pipe(delay(500));
            }

            default: {

                this.messages.push({
                    role: 'user',
                    content: intent.parametro
                });


                return this.chatService
                    .sendMessage(this.messages).pipe(
                        switchMap((response) => {
                            const assistantMessage = response.choices[0]?.message;
                            if (!assistantMessage?.content) {
                                return of<AssistantResult>({
                                    state: 'error',
                                    message: this.crearMensaje('No recibí una respuesta válida del asistente.'),
                                });
                            }

                            this.messages.push({
                                role: 'assistant',
                                content: assistantMessage.content,
                            });

                            const parsedResponse = parseAssistantResponse(assistantMessage.content);
                            if (!parsedResponse.action) {
                                return of<AssistantResult>({
                                    state: 'success',
                                    message: this.crearMensaje(parsedResponse.text),
                                });
                            }

                            const resolved = this.resolverAccion(parsedResponse.action);
                            if (resolved.error) {
                                return of<AssistantResult>({
                                    state: 'error',
                                    message: this.crearMensaje(resolved.error),
                                });
                            }

                            return of<AssistantResult>({
                                state: 'success',
                                message: {
                                    ...this.crearMensaje(parsedResponse.text || 'Preparé los datos para el formulario.'),
                                    action: parsedResponse.action,
                                    actionJson: parsedResponse.json,
                                },
                            });
                        })
                        
                    );
                
            }
                /*
                return of<AssistantResult>({
                    state: 'error',
                    message: {
                        id: crypto.randomUUID(),
                        type: 'assistant',
                        text:
                            'No estoy seguro de lo que quieres hacer. Recuerda los tips iniciales',
                        date: new Date(),
                    },
                });*/
            
        }
    }

    abrirAccionDocumento(action: CreateDocumentAction): void {
        const resolved = this.resolverAccion(action);
        if (resolved.pedido) {
            this.utilsService.modalWithParams(resolved.pedido);
        }
    }

    private resolverAccion(action: CreateDocumentAction): { pedido?: PedidoVentaDTO; error?: string } {
        const plantilla = this.resolverPlantilla(action.plantilla);
        if (!plantilla) {
            return { error: `No encontré una plantilla documental visible llamada "${action.plantilla}".` };
        }

        const caracteristicas: PedidoVentaCaracteristicaDTO[] = [];
        for (const campo of action.campos) {
            const definicion = plantilla.caracteristicas?.find(item => this.coincideCampo(item, campo.codigo));
            if (!definicion) {
                return { error: `El campo "${campo.codigo}" no existe en la plantilla "${plantilla.nombre}".` };
            }

            const caracteristica = new PedidoVentaCaracteristicaDTO();
            caracteristica.campo = definicion.llaveTabla;
            caracteristica.campoDTO = definicion;
            const conversionError = this.asignarValor(caracteristica, campo);
            if (conversionError) {
                return { error: `No pude interpretar el campo "${campo.codigo}": ${conversionError}` };
            }
            caracteristicas.push(caracteristica);
        }

        const pedido = new PedidoVentaDTO();
        pedido.plantilla = plantilla.llaveTabla;
        pedido.caracteristicas = caracteristicas;
        return { pedido };
    }

    private resolverPlantilla(identifier: string): DocumentoPlantillaDTO | undefined {
        const normalized = this.normalizar(identifier);
        const matches = this.templateService.template().filter(item => {
            const visible = PlantillaHelper.buscarPropiedad(item.propiedades, PlantillaHelper.PERMISO_PLANTILLA_LISTAR_MENU)
                && (item.tipo === DocumentoPlantillaTipoEnum.PRINCIPAL || item.tipo === DocumentoPlantillaTipoEnum.ROL);
            return visible && (this.normalizar(item.codigo) === normalized || this.normalizar(item.nombre) === normalized);
        });
        return matches.length === 1 ? matches[0] : undefined;
    }

    private coincideCampo(definicion: DocumentoPlantillaDTO['caracteristicas'][number], identifier: string): boolean {
        return this.normalizar(definicion.codigo) === this.normalizar(identifier)
            || this.normalizar(definicion.nombre) === this.normalizar(identifier)
            || this.normalizar(definicion.llaveTabla) === this.normalizar(identifier);
    }

    private asignarValor(caracteristica: PedidoVentaCaracteristicaDTO, campo: DocumentActionField): string | undefined {
        switch (campo.tipo) {
            case 'number':
                caracteristica.valorNumero = campo.valor as number;
                return undefined;
            case 'date': {
                const date = new Date(`${campo.valor}T00:00:00`);
                if (Number.isNaN(date.getTime())) {
                    return 'la fecha no es válida';
                }
                caracteristica.valorFecha = date;
                return undefined;
            }
            case 'option':
                caracteristica.valorOpcion = campo.valor as string;
                return undefined;
            case 'text':
                caracteristica.valorText = campo.valor as string;
                return undefined;
        }
    }

    private normalizar(value: string | undefined): string {
        return (value ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    }

    private crearMensaje(text: string): AssistantMessage {
        return {
            id: crypto.randomUUID(),
            type: 'assistant',
            text,
            date: new Date(),
        };
    }



    private filtrarTemplates(texto: string): DocumentoPlantillaDTO[] {
        const templates = this.templateService.template();

        if (!templates || templates.length === 0) {
            return [];
        }

        const textoNormalizado = texto
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim();

        return templates.filter(item => {
            const nombre = item.nombre?.toLowerCase() || '';
            const codigo = item.codigo?.toLowerCase() || '';

            const coincideNombre = nombre.includes(textoNormalizado);
            const coincideCodigo = codigo === textoNormalizado;

            const esVisible = (PlantillaHelper.buscarPropiedad(item.propiedades, PlantillaHelper.PERMISO_PLANTILLA_LISTAR_MENU)
                    && (item.tipo == DocumentoPlantillaTipoEnum.PRINCIPAL || item.tipo == DocumentoPlantillaTipoEnum.ROL));

            return (coincideNombre || coincideCodigo) && esVisible;
        });
    }

    abrirDocumento(doc: PedidoVentaDTO): void {
        if (this.templateService.getTemplate(doc.plantilla)) {
            this.utilsService.modalWithParams(doc, false);
        }
    }

    abrirTemplateDirect(templateId: string): void {
        this.router.navigate(['/list' + '/list/' + templateId]);
    }
}