import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MensajeDTO } from 'app/document/document.types';
import { AttachmentViewerComponent } from '../../shared/attachment-viewer/attachment-viewer.component';

@Component({
    selector: 'app-message-detail',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatIconModule, AttachmentViewerComponent],
    templateUrl: './message-detail.component.html',
    styleUrl: './message-detail.component.scss'
})
export class MessageDetailComponent implements OnInit {
    public dialogRef = inject<MatDialogRef<MessageDetailComponent>>(MatDialogRef);
    public data = inject<MensajeDTO & { _showAttachments?: boolean }>(MAT_DIALOG_DATA);

    ngOnInit(): void {}

    resend(): void {
        // El reenvío se maneja desde el list component
        this.dialogRef.close({ resend: true });
    }
}