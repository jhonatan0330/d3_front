import { Component, DestroyRef, ElementRef, inject, input, model, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { LocalStoreService } from 'app/shared/local-store.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-image-uploader',
    templateUrl: './image-uploader.component.html',
    imports: [CommonModule, MatIcon],
    styles: [`
        :host { display: block; }
    `]
})
export class ImageUploaderComponent {
    value = model<string | null>(null);
    avatar = input(false);

    private http = inject(HttpClient);
    private ls = inject(LocalStoreService);
    private destroyRef = inject(DestroyRef);

    private static IMAGE_TYPE = 'image/jpeg';
    private static IMAGE_QUALITY = 0.92;
    private static MAX_EDGE = 1024;
    private static UPLOAD_ENDPOINT = '/files/upload';

    video = viewChild<ElementRef>('video');
    canvas = viewChild<ElementRef>('canvas');

    subiendo = signal(false);
    camaraActiva = signal(false);
    revisando = signal(false);
    dataUrl = signal<string | null>(null);

    private stream: MediaStream | null = null;

    constructor() {
        this.destroyRef.onDestroy(() => this.detenerCamara());
    }

    onArchivoSeleccionado(files: FileList): void {
        if (!files.length) return;
        const file = files.item(0)!;
        const reader = new FileReader();
        reader.onload = () => {
            this.dataUrl.set(reader.result as string);
            this.subir(this.b64toFile(this.dataUrl()!, file.name));
        };
        reader.readAsDataURL(file);
        this.reiniciarInput(files);
    }

    reiniciarInput(files: FileList): void {
        (files as unknown as { value: string }).value = '';
    }

    async abrirCamara(): Promise<void> {
        if (!navigator.mediaDevices?.getUserMedia) {
            Swal.fire('Cámara', 'No se dispone de dispositivo de video', 'error');
            return;
        }
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
            const videoEl = this.video()?.nativeElement;
            if (videoEl && this.stream) {
                videoEl.srcObject = this.stream;
                videoEl.play();
                this.camaraActiva.set(true);
                this.revisando.set(false);
                this.dataUrl.set(null);
            }
        } catch (e: any) {
            Swal.fire('Cámara', e?.message || 'Error desconocido', 'error');
        }
    }

    capturar(): void {
        const _video = this.video()?.nativeElement;
        if (!_video || !_video.videoWidth) return;

        const vw = _video.videoWidth;
        const vh = _video.videoHeight;
        const square = Math.min(vw, vh);
        const sx = (vw - square) / 2;
        const sy = (vh - square) / 2;
        const out = Math.min(square, ImageUploaderComponent.MAX_EDGE);

        const _canvas = this.canvas()?.nativeElement;
        _canvas.width = out;
        _canvas.height = out;
        const ctx = _canvas.getContext('2d');
        ctx.drawImage(_video, sx, sy, square, square, 0, 0, out, out);

        this.dataUrl.set(_canvas.toDataURL(ImageUploaderComponent.IMAGE_TYPE, ImageUploaderComponent.IMAGE_QUALITY));
        this.detenerCamara();
        this.camaraActiva.set(false);
        this.revisando.set(true);
    }

    subirCaptura(): void {
        if (!this.dataUrl()) return;
        this.subir(this.b64toFile(this.dataUrl()!));
    }

    cancelarCaptura(): void {
        this.detenerCamara();
        this.camaraActiva.set(false);
        this.revisando.set(false);
        this.dataUrl.set(null);
    }

    limpiar(): void {
        this.value.set(null);
        this.dataUrl.set(null);
        this.revisando.set(false);
    }

    private subir(file: File): void {
        this.subiendo.set(true);
        const formData = new FormData();
        formData.append('file', file, file.name);
        this.http.post<string>(this.ls.getUrlAccess(ImageUploaderComponent.UPLOAD_ENDPOINT), formData)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (url) => {
                    this.value.set(url);
                    this.dataUrl.set(null);
                    this.revisando.set(false);
                    this.subiendo.set(false);
                    Swal.fire('Éxito', 'Imagen subida correctamente', 'success');
                },
                error: () => {
                    this.subiendo.set(false);
                    Swal.fire('Error', 'No se pudo subir la imagen', 'error');
                }
            });
    }

    private detenerCamara(): void {
        if (this.stream) {
            this.stream.getTracks().forEach(t => t.stop());
            this.stream = null;
        }
    }

    private b64toFile(dataURI: string, fileName = 'imagen'): File {
        const byteString = atob(dataURI.split(',')[1]);
        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        const blob = new Blob([ab], { type: mimeString });

        const ext = mimeString === 'image/png' ? 'png' : 'jpg';

        return new File([blob], `${fileName}.${ext}`, { type: mimeString, lastModified: Date.now() });
    }
}