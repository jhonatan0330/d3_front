import { Injectable, inject, signal } from '@angular/core';
import { Observable, of, delay, switchMap } from 'rxjs';
import {  AssistantIntent, AssistantMessage, AssistantResult, AssistantState,  DocumentSearchResult, TemplateSearchResult } from './assistant.models';
import { TemplateService } from 'app/modules/full/neuron/service/template.service';
import { DocumentoPlantillaDTO, PedidoVentaDTO, PedidoVentaFilterDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import { ApiService } from 'app/modules/full/neuron/service/api.service';
import { UtilsService } from 'app/modules/full/neuron/service/utils.service';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AssistantService {
    private readonly templateService = inject(TemplateService);
    private readonly api = inject(ApiService);
    private readonly utilsService = inject(UtilsService);
    private router = inject(Router);

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
        {
            id: crypto.randomUUID(),
            type: 'assistant',
            text: `📄 Tip 2 — Busca documentos 🔎 Escribe @ seguido del código exacto del documento para encontrarlo rápidamente.Por ejemplo:@FE-1234`,
            date: new Date(),
        },
        {
            id: crypto.randomUUID(),
            type: 'assistant',
            text: `🚀 Tip 3 — Entra a los módulos 🧭 Escribe / seguido del nombre o código del módulo para acceder rápidamente. No necesitas escribir el nombre completo. Por ejemplo: /gas . Te permitirá buscar módulos relacionados con gastos.`,
            date: new Date(),
        },
        {
            id: crypto.randomUUID(),
            type: 'assistant',
            text: `🤖 Tip 4 — Estoy aprendiendo 🌱 Todavía estoy creciendo. Por ahora no soy una IA, pero cada día estoy aprendiendo para poder ayudarte mucho más. ✨ ¡Pronto seré mucho más inteligente!`,
            date: new Date(),
        },
    ]);

    agregarMensaje(mensaje: AssistantMessage): void {
        this.mensajes.update(msgs => [...msgs, mensaje]);
    }

    interpretar(pregunta: string): AssistantIntent {

        if (pregunta.trim().startsWith('@')) {
            const parametro = pregunta.trim().slice(1).trim();
            if (!parametro) {
                return {
                    tipo: 'buscar-por-arroba-vacio',
                };
            }
            return {
                tipo: 'buscar-por-arroba',
                parametro: parametro,
            };
        }

        if (pregunta.trim().startsWith('/')) {
            return {
                tipo: 'buscar-template-por-slash',
                parametro: pregunta.trim().slice(1).trim(),
            };
        }

        return {
            tipo: 'desconocido',
        };
    }

    ejecutar(intent: AssistantIntent): Observable<AssistantResult> {
        switch (intent.tipo) {
            case 'buscar-por-arroba-vacio': {
                return of<AssistantResult>({
                    state: 'success',
                    message: {
                        id: crypto.randomUUID(),
                        type: 'assistant',
                        text: 'Por favor, escriba el código del documento después del símbolo @. Por ejemplo: @FE-1234',
                        date: new Date(),
                    },
                }).pipe(delay(300));
            }

            case 'buscar-por-arroba': {
                const filter: PedidoVentaFilterDTO = new PedidoVentaFilterDTO();
                filter.nombre = intent.parametro;
                return this.api.listarDocumentos(filter, null!).pipe(
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
                                const template = this.templateService.getTemplate(d.plantilla, d.server);
                                return {
                                    llaveTabla: d.llaveTabla,
                                    nombre: d.nombre,
                                    descripcion: d.descripcion,
                                    imagen: d.imagen,
                                    server: d.server,
                                    plantilla: template?.llaveTabla,
                                    nombrePlantilla: template?.nombre,
                                };
                            });
                        if (documentos.length === 1) {
                            this.abrirDocumento(docs[0]);
                        }
                        return of<AssistantResult>({
                            state: 'success',
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

            case 'buscar-template-por-slash': {
                const templates = this.filtrarTemplates(intent.parametro);
                if (templates.length === 0) {
                    return of<AssistantResult>({
                        state: 'success',
                        message: {
                            id: crypto.randomUUID(),
                            type: 'assistant',
                            text: `No se encontraron plantillas que coincidan con: ${intent.parametro}`,
                            date: new Date(),
                        },
                    }).pipe(delay(500));
                }
                const templateResults: TemplateSearchResult[] = templates.map(t => ({
                    llaveTabla: t.llaveTabla,
                    nombre: t.nombre,
                    codigo: t.codigo,
                    imagen: t.imagen,
                    server: t.server,
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

                return of<AssistantResult>({
                    state: 'error',
                    message: {
                        id: crypto.randomUUID(),
                        type: 'assistant',
                        text:
                            'No estoy seguro de lo que quieres hacer. Recuerda los tips iniciales',
                        date: new Date(),
                    },
                });
            }
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

            const esVisible = item.estado === 'P' ||
                PlantillaHelper.buscarPropiedad(item.propiedades, PlantillaHelper.PERMISO_PLANTILLA_LISTAR_MENU);

            return (coincideNombre || coincideCodigo) && esVisible;
        });
    }

    abrirDocumento(doc: PedidoVentaDTO): void {
        if (this.templateService.getTemplate(doc.plantilla, null!)) {
            this.utilsService.modalWithParams(doc, false);
        }
    }

    abrirTemplateDirect(templateId: string): void {
        this.router.navigate(['/list' + '/list/' + templateId]);
    }
}