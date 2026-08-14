import { Injectable, inject, signal } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

import {
    AssistantAction,
    AssistantMessage,
    AssistantState,
    TemplateData,
} from './assistant.models';

import { TemplateService } from 'app/modules/full/neuron/service/template.service';
import { DocumentoPlantillaDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { PlantillaHelper } from 'app/shared/plantilla-helper';

@Injectable({
    providedIn: 'root',
})
export class AssistantService {

    private readonly templateService = inject(TemplateService);

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

        /*
         * FILTRAR TEMPLATES
         *
         * Detectar cuando el usuario busca plantillas, templates o documentos
         * Ej: "buscar plantillas", "filtro ventas", "mostrar templates"
         */
        const esBusquedaTemplate = this.detectarBusquedaTemplate(texto);

        if (esBusquedaTemplate) {
            return {
                tipo: 'filtrar-templates',
                parametro: texto,
            };
        }

        /*
         * BUSCAR DOCUMENTO por código específico
         *
         * Ej: "buscar EGRF603", "muéstrame EGRF603"
         */
        const codigo = this.extraerCodigoDocumento(texto);

        if (codigo) {
            return {
                tipo: 'buscar-documento',
                parametro: codigo,
            };
        }

        /*
         * MOSTRAR VENTAS
         */
        if (
            texto.includes('mostrar ventas') ||
            texto.includes('ver ventas') ||
            texto.includes('listar ventas')
        ) {
            return {
                tipo: 'mostrar-ventas',
            };
        }

        /*
         * CREAR INGRESO
         */
        if (
            texto.includes('crear ingreso') ||
            texto.includes('nuevo ingreso') ||
            texto.includes('hacer un ingreso')
        ) {
            return {
                tipo: 'crear-ingreso',
            };
        }

        /*
         * CERRAR VENTA
         */
        if (
            texto.includes('cerrar venta') ||
            texto.includes('finalizar venta')
        ) {
            return {
                tipo: 'cerrar-venta',
            };
        }

        return {
            tipo: 'desconocido',
        };
    }


    /**
     * Ejecuta la intención.
     *
     * Por ahora simulamos la respuesta.
     *
     * Después aquí conectamos tus servicios HTTP.
     */
    ejecutar(
        intent: AssistantIntent
    ): Observable<AssistantResult> {

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


            case 'mostrar-ventas': {

                return of<AssistantResult>({
                    state: 'success',
                    message: {
                        id: crypto.randomUUID(),
                        type: 'assistant',
                        text:
                            'Claro. Voy a mostrar las ventas.',
                        date: new Date(),
                        actions: [
                            {
                                id: 'abrir-ventas',
                                label: 'Ver ventas',
                                icon: 'point_of_sale',
                                color: 'primary',
                            },
                        ],
                    },
                }).pipe(
                    delay(800)
                );
            }


            case 'crear-ingreso': {

                return of<AssistantResult>({
                    state: 'success',
                    message: {
                        id: crypto.randomUUID(),
                        type: 'assistant',
                        text:
                            'Puedo ayudarte a crear un nuevo ingreso.',
                        date: new Date(),
                        actions: [
                            {
                                id: 'crear-ingreso',
                                label: 'Crear ingreso',
                                icon: 'add_circle',
                                color: 'primary',
                            },
                        ],
                    },
                }).pipe(
                    delay(800)
                );
            }


            case 'cerrar-venta': {

                return of<AssistantResult>({
                    state: 'success',
                    message: {
                        id: crypto.randomUUID(),
                        type: 'assistant',
                        text:
                            'Puedo ayudarte a cerrar una venta.',
                        date: new Date(),
                        actions: [
                            {
                                id: 'cerrar-venta',
                                label: 'Cerrar venta',
                                icon: 'check_circle',
                                color: 'primary',
                            },
                        ],
                    },
                }).pipe(
                    delay(800)
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

        /*
         * Ejemplos:
         *
         * EGRF603
         * FV1234
         * FAC100
         * NC25
         */

        const match = texto.match(
            /\b[A-Z]{2,10}\d{1,10}\b/i
        );

        return match
            ? match[0].toUpperCase()
            : null;
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
        tipo: 'mostrar-ventas';
    }
    | {
        tipo: 'crear-ingreso';
    }
    | {
        tipo: 'cerrar-venta';
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
