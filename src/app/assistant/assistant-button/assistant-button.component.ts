import {
    Component,
    inject,
    OnInit,
} from '@angular/core';

import {
    CdkDragEnd,
    DragDropModule,
} from '@angular/cdk/drag-drop';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AssistantDialogComponent } from '../assistant-dialog/assistant-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-assistant-button',
    standalone: true,
    imports: [
        DragDropModule,
        MatButtonModule,
        MatIconModule,
    ],
    templateUrl: './assistant-button.component.html',
    styleUrl: './assistant-button.component.scss',
})
export class AssistantButtonComponent {

    
    private readonly dialog = inject(MatDialog);

    assistantPosition = {
        x: 0,
        y: 0,
    };

    private isDragging = false;


    onDragStarted(): void {
        this.isDragging = true;
    }

    onDragEnded(event: CdkDragEnd): void {

        const element = event.source.getRootElement();
        const rect = element.getBoundingClientRect();

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const margin = 24;

        /*
         * Posición actual del elemento.
         */
        const currentPosition = event.source.getFreeDragPosition();

        /*
         * Calculamos si debe quedar a la izquierda
         * o a la derecha.
         */
        const centerX = rect.left + rect.width / 2;

        const goRight = centerX >= viewportWidth / 2;

        /*
         * Posición X deseada.
         */
        const targetLeft = goRight
            ? viewportWidth - rect.width - margin
            : margin;

        /*
         * Cuánto debemos moverlo.
         */
        let newX =
            currentPosition.x +
            (targetLeft - rect.left);

        /*
         * Evitamos que quede por fuera
         * verticalmente.
         */
        let newY = currentPosition.y;

        const maxTop = viewportHeight - rect.height - margin;

        if (rect.top < margin) {
            newY += margin - rect.top;
        }

        if (rect.top > maxTop) {
            newY -= rect.top - maxTop;
        }

        /*
         * Actualizamos la posición.
         */
        this.assistantPosition = {
            x: newX,
            y: newY,
        };


        /*
         * Esperamos un momento para evitar que
         * el click posterior al drag abra el diálogo.
         */
        setTimeout(() => {
            this.isDragging = false;
        });
    }

    onAssistantClick(): void {

        if (this.isDragging) {
            return;
        }

        this.abrirAsistente();
    }

    private abrirAsistente(): void {
       this.dialog.open(AssistantDialogComponent, {
        width: '600px',
        maxWidth: '95vw',
        height: '700px',
        maxHeight: '90vh',
        panelClass: 'assistant-dialog-panel',
    });
    }

}