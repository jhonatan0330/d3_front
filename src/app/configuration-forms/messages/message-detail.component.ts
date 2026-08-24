import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MensajeDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { AttachmentViewerComponent } from '../shared/attachment-viewer.component';

@Component({
    selector: 'app-message-detail',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatIconModule, MatButtonModule, MatTabsModule, AttachmentViewerComponent],
    template: `
    <div class="bg-white dark:bg-gray-900 rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
      <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-xl font-bold">{{ data.titulo }}</h2>
        <button type="button" class="btn-icon" (click)="dialogRef.close()"><mat-icon>close</mat-icon></button>
      </div>

      <div class="flex-1 overflow-y-auto p-4 space-y-6">
        <!-- Info General -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div><span class="text-gray-500 dark:text-gray-400">Fecha:</span> <p class="font-medium">{{ data.fecha | date:'dd/MM/yyyy HH:mm:ss' }}</p></div>
          <div><span class="text-gray-500 dark:text-gray-400">Usuario:</span> <p class="font-medium">{{ data.usuario }}</p></div>
          <div><span class="text-gray-500 dark:text-gray-400">Documento:</span> <p class="font-medium">{{ data.documento || '—' }}</p></div>
          <div><span class="text-gray-500 dark:text-gray-400">Plantilla:</span> <p class="font-medium">{{ data.template || '—' }}</p></div>
          <div><span class="text-gray-500 dark:text-gray-400">Correo:</span> <p class="font-medium">{{ data.correo || '—' }}</p></div>
          <div><span class="text-gray-500 dark:text-gray-400">Transacción:</span> <p class="font-medium">{{ data.transaccion || '—' }}</p></div>
          <div class="sm:col-span-2"><span class="text-gray-500 dark:text-gray-400">Leído:</span> <p class="font-medium">{{ data.leido ? (data.leido | date:'dd/MM/yyyy HH:mm:ss') : 'No leído' }}</p></div>
          <div class="sm:col-span-2"><span class="text-gray-500 dark:text-gray-400">Enviado:</span> <p class="font-medium">{{ data.correoEnviado ? (data.correoEnviado | date:'dd/MM/yyyy HH:mm:ss') : 'No enviado' }}</p></div>
          @if (data.correoError) {
            <div class="sm:col-span-2"><span class="text-red-600 dark:text-red-400">Error:</span> <p class="font-medium text-red-600 dark:text-red-400">{{ data.correoError }}</p></div>
          }
        </div>

        <!-- Parámetros -->
        @if (data.parametros) {
          <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 class="font-medium mb-2">Parámetros</h3>
            <pre class="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm font-mono overflow-auto max-h-40">{{ data.parametros }}</pre>
          </div>
        }

        <!-- Reporte -->
        @if (data.reporte) {
          <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 class="font-medium mb-2">Reporte Asociado</h3>
            <p class="font-mono text-sm">{{ data.reporte }}</p>
          </div>
        }

        <!-- Adjuntos -->
        @if (data.adjuntoURL) {
          <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 class="font-medium mb-2">Adjuntos</h3>
            <app-attachment-viewer [adjuntoURL]="data.adjuntoURL"></app-attachment-viewer>
          </div>
        }
      </div>

      <div class="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
        @if (!data.correoEnviado || data.correoError) {
          <button type="button" class="btn-flat-primary" (click)="resend()">
            <mat-icon>send</mat-icon>
            Reenviar
          </button>
        }
        <button type="button" class="btn-flat" (click)="dialogRef.close()">Cerrar</button>
      </div>
    </div>
  `,
    styles: [`
    .btn-flat { padding: 0.5rem 1.5rem; border-radius: 4px; font-weight: 500; border: 1px solid #e0e0e0; background: white; color: #333; }
    .btn-flat:hover { background: #f5f5f5; }
    .btn-flat-primary { padding: 0.5rem 1.5rem; border-radius: 4px; font-weight: 500; background: #3f51b5; color: white; border: none; display: inline-flex; align-items: center; gap: 0.5rem; }
    .btn-flat-primary:hover { background: #303f9f; }
    .btn-icon { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 50%; border: none; background: transparent; color: #666; cursor: pointer; }
    .btn-icon:hover { background: #f5f5f5; color: #333; }
  `]
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