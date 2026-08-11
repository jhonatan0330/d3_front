import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    inject,
    signal,
} from '@angular/core';

import {
    FormsModule,
} from '@angular/forms';

import {
    MatButtonModule,
} from '@angular/material/button';

import {
    MatIconModule,
} from '@angular/material/icon';

import {
    MatFormFieldModule,
} from '@angular/material/form-field';

import {
    MatInputModule,
} from '@angular/material/input';

import {
    MatDialogRef,
} from '@angular/material/dialog';

import {
    takeUntilDestroyed,
} from '@angular/core/rxjs-interop';

import {
    AssistantMessage,
    AssistantState,
} from '../assistant.models';

import {
    AssistantService,
} from '../assistant.service';


@Component({
    selector: 'app-assistant-dialog',
    standalone: true,

    imports: [
        FormsModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
    ],

    templateUrl: './assistant-dialog.component.html',

    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssistantDialogComponent {

    private readonly dialogRef =
        inject(MatDialogRef<AssistantDialogComponent>);

    private readonly assistantService =
        inject(AssistantService);

    private readonly destroyRef =
        inject(DestroyRef);


    /* ============================================================
     * ESTADO
     * ========================================================== */

    readonly estado =
        signal<AssistantState>('idle');


    readonly mensajes =
        signal<AssistantMessage[]>([
            {
                id: crypto.randomUUID(),
                type: 'assistant',
                text:
                    'Hola 👋 Soy tu asistente. ¿Qué necesitas hacer?',
                date: new Date(),
            },
        ]);


    pregunta = '';


    /* ============================================================
     * GIF
     * ========================================================== */

    private readonly animaciones: Record<
        AssistantState,
        string
    > = {

        idle:
            'assets/images/assistant.gif',

        listening:
            'assets/images/assistant.gif',

        thinking:
            'assets/images/assistant.gif',

        searching:
            'assets/images/assistant.gif',

        success:
            'assets/images/assistant.gif',

        error:
            'assets/images/assistant.gif',
    };


    get imagenAssistant(): string {

        return this.animaciones[
            this.estado()
        ];
    }


    /* ============================================================
     * ENVIAR
     * ========================================================== */

    enviar(): void {

        const texto =
            this.pregunta.trim();

        if (!texto) {
            return;
        }


        /*
         * Mensaje del usuario
         */

        this.agregarMensaje({
            id: crypto.randomUUID(),
            type: 'user',
            text: texto,
            date: new Date(),
        });


        this.pregunta = '';


        /*
         * El asistente está pensando
         */

        this.estado.set('thinking');


        /*
         * Interpretamos la intención
         */

        const intent =
            this.assistantService.interpretar(texto);


        /*
         * Estado visual
         */

        if (intent.tipo === 'buscar-documento') {

            this.estado.set('searching');

        }


        /*
         * Ejecutamos
         */

        this.assistantService
            .ejecutar(intent)

            .pipe(
                takeUntilDestroyed(
                    this.destroyRef
                )
            )

            .subscribe({

                next: resultado => {

                    this.estado.set(
                        resultado.state
                    );


                    this.agregarMensaje(
                        resultado.message
                    );

                },


                error: () => {

                    this.estado.set(
                        'error'
                    );


                    this.agregarMensaje({

                        id: crypto.randomUUID(),

                        type: 'assistant',

                        text:
                            'Ocurrió un error procesando tu solicitud.',

                        date: new Date(),

                    });

                },

            });
    }


    /* ============================================================
     * ACCIONES
     * ========================================================== */

    ejecutarAccion(
        actionId: string,
        message: AssistantMessage
    ): void {

        console.log(
            'Acción:',
            actionId,
            message
        );


        switch (actionId) {

            case 'ver-documento':

                this.verDocumento(message);

                break;


            case 'anular-documento':

                this.anularDocumento(message);

                break;


            case 'abrir-ventas':

                this.abrirVentas();

                break;


            case 'crear-ingreso':

                this.crearIngreso();

                break;


            case 'cerrar-venta':

                this.cerrarVenta();

                break;

        }
    }


    /* ============================================================
     * ACCIONES REALES
     * ========================================================== */

    private verDocumento(
        message: AssistantMessage
    ): void {

        /*
         * Aquí conectaremos:
         *
         * router.navigate(...)
         *
         * o tu servicio actual.
         */

        console.log(
            'Ver documento',
            message
        );
    }


    private anularDocumento(
        message: AssistantMessage
    ): void {

        console.log(
            'Anular documento',
            message
        );
    }


    private abrirVentas(): void {

        console.log(
            'Abrir ventas'
        );
    }


    private crearIngreso(): void {

        console.log(
            'Crear ingreso'
        );
    }


    private cerrarVenta(): void {

        console.log(
            'Cerrar venta'
        );
    }


    /* ============================================================
     * MENSAJES
     * ========================================================== */

    private agregarMensaje(
        mensaje: AssistantMessage
    ): void {

        this.mensajes.update(
            mensajes => [
                ...mensajes,
                mensaje,
            ]
        );
    }


    /* ============================================================
     * CERRAR
     * ========================================================== */

    cerrar(): void {

        this.dialogRef.close();

    }
}
