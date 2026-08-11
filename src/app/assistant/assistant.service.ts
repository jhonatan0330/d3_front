import { Injectable, inject } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

import {
    AssistantAction,
    AssistantMessage,
    AssistantState,
} from './assistant.models';

@Injectable({
    providedIn: 'root',
})
export class AssistantService {

    /**
     * Aquí posteriormente inyectaremos tus servicios reales.
     *
     * Ejemplo:
     *
     * private readonly documentosService = inject(DocumentosService);
     * private readonly ventasService = inject(VentasService);
     */

    interpretar(pregunta: string): AssistantIntent {

        const texto = this.normalizar(pregunta);

        /*
         * BUSCAR DOCUMENTO
         *
         * Ej:
         * "buscar EGRF603"
         * "muéstrame EGRF603"
         * "quiero ver el documento EGRF603"
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

            case 'buscar-documento':

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


            case 'mostrar-ventas':

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


            case 'crear-ingreso':

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


            case 'cerrar-venta':

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


            default:

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
}


/* ============================================================
 * INTENCIONES
 * ========================================================== */

export type AssistantIntent =
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
