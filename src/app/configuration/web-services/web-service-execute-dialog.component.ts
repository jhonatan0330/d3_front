import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { WebServiceDTO, WebServiceEjecucionDTO } from 'app/document/model/sw42.domain';
import { WebServiceConfigService } from './web-service.service';
import Swal from 'sweetalert2';

interface ExecuteDialogData {
    webService: WebServiceDTO;
}

@Component({
    selector: 'app-web-service-execute-dialog',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule],
    template: `
    <div class="max-w-2xl w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 space-y-4">
      <h2 class="text-xl font-bold border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center gap-2">
        <mat-icon class="text-blue-500">play_arrow</mat-icon>
        Ejecutar Web Service: {{ data.webService.nombre }}
      </h2>

      <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
        <p class="text-sm text-gray-600 dark:text-gray-400"><strong>URL:</strong> {{ data.webService.url }}</p>
        <p class="text-sm text-gray-600 dark:text-gray-400"><strong>Método:</strong> <span class="badge" [class]="getMetodoBadge(data.webService.metodo)">{{ data.webService.metodo }}</span></p>
        <p class="text-sm text-gray-600 dark:text-gray-400"><strong>Auth:</strong> {{ data.webService.autenticacion }}</p>
      </div>

      <form #form="ngForm" (ngSubmit)="onExecute()">
        <div>
          <label class="block text-sm font-semibold mb-1">Parámetros (JSON)</label>
          <textarea
            [(ngModel)]="parametros"
            name="parametros"
            rows="8"
            class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            placeholder='{}'
            required></textarea>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Parámetros por defecto del web service se fusionarán con estos</p>
        </div>

        @if (lastExecution) {
          <div class="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
            <h3 class="font-medium">Última Ejecución</h3>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div><span class="text-gray-500 dark:text-gray-400">Estado:</span> <span class="badge ml-2" [class]="getExecStatusBadge(lastExecution.estado)">{{ getExecStatusLabel(lastExecution.estado) }}</span></div>
              <div><span class="text-gray-500 dark:text-gray-400">Duración:</span> <span class="ml-2 font-mono">{{ lastExecution.duracion }} ms</span></div>
              <div class="col-span-2"><span class="text-gray-500 dark:text-gray-400">Fecha:</span> <span class="ml-2">{{ lastExecution.fechaEjecucion | date:'dd/MM/yyyy HH:mm:ss' }}</span></div>
              <div class="col-span-2"><span class="text-gray-500 dark:text-gray-400">Parámetros enviados:</span> <pre class="mt-1 text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded font-mono overflow-auto">{{ lastExecution.parametrosEntrada }}</pre></div>
              <div class="col-span-2"><span class="text-gray-500 dark:text-gray-400">Resultado:</span> <pre class="mt-1 text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded font-mono overflow-auto">{{ lastExecution.resultado }}</pre></div>
              @if (lastExecution.error) {
                <div class="col-span-2"><span class="text-red-600 dark:text-red-400">Error:</span> <pre class="mt-1 text-xs bg-red-50 dark:bg-red-900/30 p-2 rounded font-mono overflow-auto">{{ lastExecution.error }}</pre></div>
              }
            </div>
          </div>
        }

        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button type="button" class="btn-flat" (click)="dialogRef.close()">Cerrar</button>
          <button type="submit" class="btn-flat-primary" [disabled]="cargando || !form.valid">
            <mat-icon *ngIf="cargando" class="animate-spin">refresh</mat-icon>
            {{ cargando ? 'Ejecutando...' : 'Ejecutar' }}
          </button>
        </div>
      </form>
    </div>
  `,
    styles: [`
    .btn-flat { padding: 0.5rem 1.5rem; border-radius: 4px; font-weight: 500; border: 1px solid #e0e0e0; background: white; color: #333; }
    .btn-flat:hover { background: #f5f5f5; }
    .btn-flat-primary { padding: 0.5rem 1.5rem; border-radius: 4px; font-weight: 500; background: #3f51b5; color: white; border: none; display: inline-flex; align-items: center; gap: 0.5rem; }
    .btn-flat-primary:hover:not(:disabled) { background: #303f9f; }
    .btn-flat-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .badge { padding: 0.125rem 0.5rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 500; }
    .badge-metodo-get { background: #e3f2fd; color: #1565c0; }
    .badge-metodo-post { background: #e8f5e9; color: #2e7d32; }
    .badge-metodo-put { background: #fff3e0; color: #ef6c00; }
    .badge-metodo-delete { background: #fce4ec; color: #c62828; }
    .badge-exec-success { background: #e8f5e9; color: #2e7d32; }
    .badge-exec-error { background: #fce4ec; color: #c62828; }
    .badge-exec-pending { background: #fff3e0; color: #ef6c00; }
  `]
})
export class WebServiceExecuteDialogComponent implements OnInit {
    private service = inject(WebServiceConfigService);
    public dialogRef = inject<MatDialogRef<WebServiceExecuteDialogComponent>>(MatDialogRef);
    public data = inject<ExecuteDialogData>(MAT_DIALOG_DATA);

    parametros = '{}';
    lastExecution: WebServiceEjecucionDTO | null = null;
    cargando = false;

    ngOnInit(): void {
        if (this.data.webService.parametros) {
            this.parametros = this.data.webService.parametros;
        }
        this.loadLastExecution();
    }

    loadLastExecution(): void {
        this.service.getExecutionsByWebService(this.data.webService.llaveTabla).subscribe({
            next: (execs) => {
                if (execs.length > 0) {
                    this.lastExecution = execs[0];
                }
            }
        });
    }

    onExecute(): void {
        this.cargando = true;
        this.service.executeWebService(this.data.webService.llaveTabla, this.parametros).subscribe({
            next: (result) => {
                this.cargando = false;
                this.lastExecution = result;
                Swal.fire({
                    title: result.estado === 'A' ? 'Éxito' : 'Error',
                    text: result.estado === 'A' ? 'Web Service ejecutado correctamente' : (result.error || 'Error en la ejecución'),
                    icon: result.estado === 'A' ? 'success' : 'error',
                    timer: 3000,
                    showConfirmButton: false
                });
            },
            error: (err) => {
                this.cargando = false;
                Swal.fire('Error', 'No se pudo ejecutar el web service', 'error');
            }
        });
    }

    getMetodoBadge(metodo: string): string {
        const badges: Record<string, string> = { 'GET': 'badge-metodo-get', 'POST': 'badge-metodo-post', 'PUT': 'badge-metodo-put', 'DELETE': 'badge-metodo-delete' };
        return badges[metodo] || 'badge-secondary';
    }

    getExecStatusLabel(estado: string): string {
        const labels: Record<string, string> = { 'A': 'Exitoso', 'E': 'Error', 'P': 'Pendiente' };
        return labels[estado] || estado;
    }

    getExecStatusBadge(estado: string): string {
        const badges: Record<string, string> = { 'A': 'badge-exec-success', 'E': 'badge-exec-error', 'P': 'badge-exec-pending' };
        return badges[estado] || 'badge-secondary';
    }
}