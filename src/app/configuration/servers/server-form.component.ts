import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ServidorDTO } from 'app/document/document.types';
import { ServerService } from '../configuracion.api';
import { PropertyPanelComponent } from '../shared/property-panel.component';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-server-form',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatFormFieldModule, MatSelectModule, MatIconModule],
    template: `
    <div class="max-w-3xl w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 space-y-6 max-h-[90vh] overflow-y-auto">
      <h2 class="text-xl font-bold border-b border-gray-200 dark:border-gray-700 pb-2">{{ data?.llaveTabla ? 'Editar Servidor' : 'Nuevo Servidor' }}</h2>

      <form #form="ngForm" (ngSubmit)="onSubmit()">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold mb-1">Nombre *</label>
            <input type="text" [(ngModel)]="servidor.nombre" name="nombre" required class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-semibold mb-1">Tipo *</label>
            <mat-form-field appearance="outline" class="w-full"><mat-select [(ngModel)]="servidor.tipo" name="tipo" required><mat-option value="F">FTP</mat-option><mat-option value="W">Web</mat-option><mat-option value="B">Base de Datos</mat-option><mat-option value="E">Correo</mat-option><mat-option value="L">FTP Local</mat-option></mat-select></mat-form-field>
          </div>
          <div class="sm:col-span-2">
            <label class="block text-sm font-semibold mb-1">URL</label>
            <input type="text" [(ngModel)]="servidor.url" name="url" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-semibold mb-1">Orden</label>
            <input type="number" [(ngModel)]="servidor.orden" name="orden" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-semibold mb-1">Puerto</label>
            <input type="text" [(ngModel)]="servidor.puerto" name="puerto" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-semibold mb-1">Usuario</label>
            <input type="text" [(ngModel)]="servidor.usuario" name="usuario" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-semibold mb-1">Clave</label>
            <input type="password" [(ngModel)]="servidor.clave" name="clave" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-semibold mb-1">Base</label>
            <input type="text" [(ngModel)]="servidor.base" name="base" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-semibold mb-1">URL Conexión</label>
            <input type="text" [(ngModel)]="servidor.urlConexion" name="urlConexion" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div class="sm:col-span-2">
            <label class="block text-sm font-semibold mb-1">Servidor Respaldo</label>
            <input type="text" [(ngModel)]="servidor.servidorRespaldo" name="servidorRespaldo" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button type="button" class="btn-flat" (click)="openPropiedades()" [disabled]="!servidor.llaveTabla"><mat-icon>tune</mat-icon> Propiedades</button>
          <button type="button" class="btn-flat" (click)="dialogRef.close()">Cancelar</button>
          <button type="submit" class="btn-flat-primary" [disabled]="cargando || !form.valid">{{ cargando ? 'Guardando...' : (data?.llaveTabla ? 'Actualizar' : 'Crear') }}</button>
        </div>
      </form>
    </div>
  `,
    styles: []
})
export class ServerFormComponent implements OnInit {
    public dialogRef = inject<MatDialogRef<ServerFormComponent>>(MatDialogRef);
    public data = inject<ServidorDTO | null>(MAT_DIALOG_DATA);

    private service = inject(ServerService);
    private dialog = inject(MatDialog);

    servidor: ServidorDTO = new ServidorDTO();
    cargando = false;

    ngOnInit(): void {
        if (this.data) { this.servidor = { ...this.data }; }
        else {
            this.servidor = new ServidorDTO();
            this.servidor.estado = 'A';
        }
    }

    openPropiedades(): void {
        if (!this.servidor.llaveTabla) return;
        this.dialog.open(PropertyPanelComponent, {
            width: '800px', maxWidth: '95vw', maxHeight: '90vh',
            data: { campoKey: this.servidor.llaveTabla, tipoOrigen: 'S', titulo: this.servidor.nombre }
        });
    }

    onSubmit(): void {
        this.cargando = true;

        const request$ = this.servidor.llaveTabla
            ? this.service.updateServidor(this.servidor)
            : this.service.createServidor(this.servidor);

        request$.subscribe({
            next: (result) => {
                this.cargando = false;
                Swal.fire('Éxito', 'Servidor guardado correctamente', 'success');
                this.dialogRef.close(result);
            },
            error: (err) => {
                this.cargando = false;
                Swal.fire('Error', 'No se pudo guardar el servidor', 'error');
            }
        });
    }
}