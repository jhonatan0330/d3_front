import {
    Component,
    inject,
} from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { AssistantDialogComponent } from '../assistant-dialog/assistant-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-assistant-button',
    standalone: true,
    imports: [ 
        MatIconModule],
    templateUrl: './assistant-button.component.html',
    styleUrl: './assistant-button.component.scss',
})
export class AssistantButtonComponent  {

    private readonly dialog = inject(MatDialog);


    onAssistantClick(): void {

        this.dialog.open(AssistantDialogComponent, {
        width: '600px',
        maxWidth: '95vw',
        height: '700px',
        maxHeight: '90vh',
        disableClose: true,
        panelClass: 'assistant-dialog-panel',
    });
    }


}