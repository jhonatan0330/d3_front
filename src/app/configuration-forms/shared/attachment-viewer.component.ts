import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

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
    template: `
    @if (attachments.length > 0) {
      <div class="space-y-2">
        <h4 class="font-medium text-gray-900 dark:text-gray-100">Adjuntos ({{ attachments.length }})</h4>
        <div class="flex flex-wrap gap-2">
          @for (att of attachments; track att.url) {
            <div class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <mat-icon [class.text-blue-500]="att.isImage" [class.text-green-500]="!att.isImage" class="text-xl">
                {{ att.isImage ? 'image' : 'insert_drive_file' }}
              </mat-icon>
              <span class="text-sm text-gray-900 dark:text-gray-100 truncate max-w-xs">{{ att.name }}</span>
              <button type="button"
                class="btn-icon btn-flat-primary ml-auto"
                (click)="openAttachment(att)"
                aria-label="Ver adjunto">
                <mat-icon>open_in_new</mat-icon>
              </button>
              <button type="button"
                class="btn-icon btn-flat"
                (click)="downloadAttachment(att)"
                aria-label="Descargar adjunto">
                <mat-icon>download</mat-icon>
              </button>
            </div>
          }
        </div>
      </div>
    }
  `,
    styles: [`
    .btn-icon {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }
    .btn-flat-primary {
      background: #3f51b5;
      color: white;
    }
    .btn-flat-primary:hover { background: #303f9f; }
    .btn-flat {
      background: white;
      color: #333;
      border: 1px solid #e0e0e0;
    }
    .btn-flat:hover { background: #f5f5f5; }
  `]
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
        const dialogRef = this.dialog.open(ImagePreviewDialogComponent, {
            maxWidth: '90vw',
            maxHeight: '90vh',
            panelClass: 'image-preview-dialog',
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

@Component({
    selector: 'app-image-preview-dialog',
    standalone: true,
    imports: [CommonModule, MatIconModule, MatButtonModule],
    template: `
    <div class="bg-black p-4">
      <div class="flex justify-between items-center mb-4 text-white">
        <h3 class="font-medium">{{ data.name }}</h3>
        <button type="button" class="btn-icon" (click)="dialogRef.close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>
      <div class="flex justify-center items-center max-h-[70vh]">
        <img [src]="data.url" class="max-w-full max-h-full object-contain" alt="Vista previa" />
      </div>
    </div>
  `
})
class ImagePreviewDialogComponent {
    dialogRef = inject(MatDialogRef<ImagePreviewDialogComponent>);
    data = inject<{ url: SafeUrl; name: string }>(MAT_DIALOG_DATA);
}