import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SafeUrl } from '@angular/platform-browser';

@Component({
    selector: 'app-image-preview-dialog',
    standalone: true,
    imports: [CommonModule, MatIconModule, MatDialogModule],
    templateUrl: './image-preview-dialog.component.html'
})
export class ImagePreviewDialogComponent {
    dialogRef = inject(MatDialogRef<ImagePreviewDialogComponent>);
    data = inject<{ url: SafeUrl; name: string }>(MAT_DIALOG_DATA);
}
