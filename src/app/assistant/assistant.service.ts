import { Injectable, inject, signal } from '@angular/core';
import { Observable, of, delay, switchMap } from 'rxjs';
import { AssistantIntent, AssistantMessage, AssistantResult, ChatMessage, DocumentSearchResult, TemplateSearchResult } from './assistant.models';
import { TemplateService } from 'app/document/service/template.service';
import { DocumentoPlantillaDTO, PedidoVentaDTO, PedidoVentaFilterDTO } from 'app/document/document.types';
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
                    
                            const assistantMessage =
                                response.choices[0]?.message;

                            
                            if (assistantMessage) {
                                
                                this.messages.push({
                                    role: 'assistant',
                                    content: assistantMessage.content
                                });
                                
                            }
                            return of<AssistantResult>({
                                state: 'success',
                                message: {
                                    id: crypto.randomUUID(),
                                    type: 'assistant',
                                    text: assistantMessage.content,
                                    date: new Date(),
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
                    && item.tipo == 'P');

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