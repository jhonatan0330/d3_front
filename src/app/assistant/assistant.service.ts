import { Injectable, inject, signal } from '@angular/core';
import { Observable, of, delay, switchMap } from 'rxjs';
import { AssistantAction, AssistantMessage, AssistantState, TemplateData, DocumentSearchResult } from './assistant.models';
import { TemplateService } from 'app/modules/full/neuron/service/template.service';
import { DocumentoPlantillaDTO, PedidoVentaDTO, PedidoVentaFilterDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import { ApiService } from 'app/modules/full/neuron/service/api.service';
import { UtilsService } from 'app/modules/full/neuron/service/utils.service';

@Injectable({ providedIn: 'root' })
export class AssistantService {
    private readonly templateService = inject(TemplateService);
    private readonly api = inject(ApiService);
    private readonly utilsService = inject(UtilsService);

    isOpenDialog = signal<boolean>(true);

    readonly mensajes = signal<AssistantMessage[]>([
        {
            id: crypto.randomUUID(),
            type: 'assistant',
            text: 'Hola \u{1F44B}\uFE0F Soy tu asistente. \u00BFQu\u00E9 necesitas hacer?',
            date: new Date(),
        },
    ]);

    agregarMensaje(mensaje: AssistantMessage): void {
        this.mensajes.update(msgs => [...msgs, mensaje]);
    }

    interpretar(pregunta: string): AssistantIntent {
        const texto = this.normalizar(pregunta);

        if (pregunta.trim().startsWith('@')) {
            return {
                tipo: 'buscar-por-arroba',
                parametro: pregunta.trim().slice(1).trim(),
            };
        }

        const esBusquedaTemplate = this.detectarBusquedaTemplate(texto);
        if (esBusquedaTemplate) {
            return {
                tipo: 'filtrar-templates',
                parametro: texto,
            };
        }
        const codigo = this.extraerCodigoDocumento(texto);
        if (codigo) {
            return {
                tipo: 'buscar-documento',
                parametro: codigo,
            };
        }
        return {
            tipo: 'desconocido',
        };
    }

    ejecutar(        intent: AssistantIntent    ): Observable<AssistantResult> {
        switch (intent.tipo) {
            case 'filtrar-templates': {
                const templates = this.filtrarTemplates(intent.parametro);
                if (templates.length === 0) {
                    return of<AssistantResult>({
                        state: 'success',
                        message: {
                            id: crypto.randomUUID(),
                            type: 'assistant',
                            text: 'No encontré plantillas que coincidan con tu búsqueda.',
                            date: new Date(),
                        },
                    }).pipe(delay(500));
                }
                const actions: AssistantAction[] = templates.slice(0, 10).map(template => ({
                    id: 'abrir-template',
                    label: template.nombre,
                    icon: 'description',
                    color: 'primary',
                    image: template.imagen,
                }));
                const message: AssistantMessage = {
                    id: crypto.randomUUID(),
                    type: 'assistant',
                    text: `Encontré ${templates.length} plantilla(s):`,
                    date: new Date(),
                    actions: actions,
                    data: templates.slice(0, 10).map(t => ({
                        llaveTabla: t.llaveTabla,
                        server: t.server,
                        proceso: t.proceso,
                        tipo: this.getTipoTemplate(t),
                    })) as TemplateData[],
                };

                return of<AssistantResult>({
                    state: 'success',
                    message,
                }).pipe(delay(800));
            }


            case 'buscar-documento': {

                return of<AssistantResult>({
                    state: 'success',
                    message: {
                        id: crypto.randomUUID(),
                        type: 'assistant',
                        text:
                            `Encontré el documento ${intent.parametro}.`,
                        date: new Date(),
                        actions: [
                            {
                                id: 'ver-documento',
                                label: 'Ver documento',
                                icon: 'visibility',
                                color: 'primary',
                            },
                            {
                                id: 'anular-documento',
                                label: 'Anular',
                                icon: 'cancel',
                                color: 'warn',
                            },
                        ],
                    },
                }).pipe(
                    delay(1000)
                );
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
                        if (docs.length === 1) {
                            const doc = docs[0];
                            this.abrirDocumento(doc);
                            return of<AssistantResult>({
                                state: 'success',
                                message: {
                                    id: crypto.randomUUID(),
                                    type: 'assistant',
                                    text: 'Documento abierto',
                                    date: new Date(),
                                },
                            });
                        }
                        const documentos: DocumentSearchResult[] = docs
                            .filter(d => d.estado !== 'I')
                            .map(d => ({
                                llaveTabla: d.llaveTabla,
                                nombre: d.nombre,
                                descripcion: d.descripcion,
                                imagen: d.imagen,
                                server: d.server,
                            }));
                        return of<AssistantResult>({
                            state: 'success',
                            message: {
                                id: crypto.randomUUID(),
                                type: 'assistant',
                                text: `Encontré ${documentos.length} documento(s):`,
                                date: new Date(),
                                documents: documentos,
                            },
                        });
                    })
                );
            }

            default: {

                return of<AssistantResult>({
                    state: 'error',
                    message: {
                        id: crypto.randomUUID(),
                        type: 'assistant',
                        text:
                            'No estoy seguro de lo que quieres hacer. Puedes intentar buscar un documento, mostrar las ventas, crear un ingreso o cerrar una venta.',
                        date: new Date(),
                    },
                });
            }
        }
    }


    private normalizar(texto: string): string {
        return texto
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim();
    }

    private extraerCodigoDocumento(texto: string): string | null {
        const match = texto.match(            /\b[A-Z]{2,10}\d{1,10}\b/i        );
        return match            ? match[0].toUpperCase()            : null;
        }


    private detectarBusquedaTemplate(texto: string): boolean {
        const palabrasClave = [
            'buscar', 'busca', 'buscar', 'filtrar', 'filtro',
            'template', 'templates', 'plantilla', 'plantillas',
            'mostrar', 'ver', 'listar', 'consulta', 'consultar'
        ];

        return palabrasClave.some(palabra => texto.includes(palabra));
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
                PlantillaHelper.buscarPropiedad(item.propiedades, PlantillaHelper.PERMISO_PLANTILLA_LISTAR_MENU) ||
                PlantillaHelper.buscarPropiedad(item.propiedades, PlantillaHelper.PERMISO_PLANTILLA_CREAR);

            return (coincideNombre || coincideCodigo) && esVisible;
        });
    }


    private getTipoTemplate(template: DocumentoPlantillaDTO): string {
        if (template.estado === 'R') return 'Report';
        if (template.estado === 'T') return 'Process';
        if (PlantillaHelper.buscarPropiedad(template.propiedades, PlantillaHelper.PERMISO_PLANTILLA_CREAR)) return 'Report';
        return 'Template';
    }

    abrirDocumento(doc: PedidoVentaDTO): void {
        if (this.templateService.getTemplate(doc.plantilla, null!)) {
            this.utilsService.modalWithParams(doc, false);
        }
    }
}


/* ============================================================
 * INTENCIONES
 * ========================================================== */

export type AssistantIntent =
    | {
        tipo: 'filtrar-templates';
        parametro: string;
    }
    | {
        tipo: 'buscar-documento';
        parametro: string;
    }
    | {
        tipo: 'buscar-por-arroba';
        parametro: string;
    }
    | {
        tipo: 'desconocido';
    };


/* ============================================================
 * RESULTADO
 * ========================================================== */

export interface AssistantResult {
    state: AssistantState;
    message: AssistantMessage;
}
