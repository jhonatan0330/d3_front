import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ImagePreviewDialogComponent } from '../image-preview-dialog/image-preview-dialog.component';

interface Attachment {
    url: string;
    name: string;
    type: string;
    isImage: boolean;
}

@Component({
    selector: 'app-attachment-viewer',
    standalone: true,
    imports: [CommonModule, MatIconModule, MatDialogModule],
    templateUrl: './attachment-viewer.component.html',
    styleUrl: './attachment-viewer.component.scss'
})
export class AttachmentViewerComponent {
    private sanitizer = inject(DomSanitizer);
    private dialog = inject(MatDialog);

    @Input() adjuntoURL: string = '';

    get attachments(): Attachment[] {
        if (!this.adjuntoURL) return [];

        return this.adjuntoURL
            .split(/[;,\n]/)
            .map(u => u.trim())
            .filter(u => u.length > 0)
            .map(url => ({
                url,
                name: this.extractFileName(url),
                type: this.getFileType(url),
                isImage: this.isImageUrl(url)
            }));
    }

    private extractFileName(url: string): string {
        try {
            const decoded = decodeURIComponent(url);
            const parts = decoded.split('/');
            return parts[parts.length - 1] || url;
        } catch {
            return url;
        }
    }

    private getFileType(url: string): string {
        const ext = url.split('.').pop()?.toLowerCase() || '';
        const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
        const docExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];
        if (imageExts.includes(ext)) return 'image';
        if (docExts.includes(ext)) return 'document';
        return 'file';
    }

    private isImageUrl(url: string): boolean {
        return this.getFileType(url) === 'image';
    }

    openAttachment(att: Attachment): void {
        if (att.isImage) {
            this.openImageModal(att.url);
        } else {
            window.open(att.url, '_blank', 'noopener,noreferrer');
        }
    }

    private openImageModal(url: string): void {
        const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        this.dialog.open(ImagePreviewDialogComponent, {
            maxWidth: '90vw',
            maxHeight: '90vh',
            panelClass: 'image-preview-dialog',
            disableClose: true,
            data: { url: safeUrl, name: this.extractFileName(url) }
        });
    }

    downloadAttachment(att: Attachment): void {
        const link = document.createElement('a');
        link.href = att.url;
        link.download = att.name;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
