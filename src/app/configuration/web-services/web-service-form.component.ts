import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { WebServiceDTO } from 'app/document/model/sw42.domain';
import { PropertyFieldComponent } from '../shared/property-field.component';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-web-service-form',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatFormFieldModule, MatSelectModule, PropertyFieldComponent],
    template: `
    <div class="max-w-3xl w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 space-y-6 max-h-[90vh] overflow-y-auto">
      <h2 class="text-xl font-bold border-b border-gray-200 dark:border-gray-700 pb-2">
        {{ data?.llaveTabla ? 'Editar Web Service' : 'Nuevo Web Service' }}
      </h2>

      <form #form="ngForm" (ngSubmit)="onSubmit()">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="sm:col-span-2">
            <label class="block text-sm font-semibold mb-1">Nombre *</label>
            <input type="text" [(ngModel)]="ws.nombre" name="nombre" required class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div class="sm:col-span-2">
            <label class="block text-sm font-semibold mb-1">URL *</label>
            <input type="text" [(ngModel)]="ws.url" name="url" required class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-semibold mb-1">Método *</label>
            <mat-form-field appearance="outline" class="w-full">
              <mat-select [(ngModel)]="ws.metodo" name="metodo" required>
                <mat-option value="GET">GET</mat-option>
                <mat-option value="POST">POST</mat-option>
                <mat-option value="PUT">PUT</mat-option>
                <mat-option value="DELETE">DELETE</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <div>
            <label class="block text-sm font-semibold mb-1">Autenticación</label>
            <mat-form-field appearance="outline" class="w-full">
              <mat-select [(ngModel)]="ws.autenticacion" name="autenticacion">
                <mat-option value="NONE">Ninguna</mat-option>
                <mat-option value="BASIC">Basic Auth</mat-option>
                <mat-option value="BEARER">Bearer Token</mat-option>
                <mat-option value="API_KEY">API Key</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <div>
            <label class="block text-sm font-semibold mb-1">Usuario</label>
            <input type="text" [(ngModel)]="ws.usuario" name="usuario" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-semibold mb-1">Clave</label>
            <input type="password" [(ngModel)]="ws.clave" name="clave" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-semibold mb-1">Timeout (segundos) *</label>
            <input type="number" [(ngModel)]="ws.timeout" name="timeout" required min="1" max="300" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-semibold mb-1">Reintentos *</label>
            <input type="number" [(ngModel)]="ws.reintentos" name="reintentos" required min="0" max="10" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div class="sm:col-span-2">
          <label class="block text-sm font-semibold mb-1">Cabeceras (JSON)</label>
          <textarea [(ngModel)]="ws.cabeceras" name="cabeceras" rows="3" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm" placeholder='{"Content-Type": "application/json"}'></textarea>
        </div>

        <div class="sm:col-span-2">
          <label class="block text-sm font-semibold mb-1">Parámetros por defecto (JSON)</label>
          <textarea [(ngModel)]="ws.parametros" name="parametros" rows="4" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm" placeholder='{}'></textarea>
        </div>

        <app-property-field
          [propiedades]="ws.propiedades || []"
          [tipoOrigen]="'W'"
          [campoKey]="ws.llaveTabla || ''"
          (propiedadesChange)="onPropiedadesChange($event)">
        </app-property-field>

        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button type="button" class="btn-flat" (click)="dialogRef.close()">Cancelar</button>
          <button type="submit" class="btn-flat-primary" [disabled]="cargando || !form.valid">{{ cargando ? 'Guardando...' : (data?.llaveTabla ? 'Actualizar' : 'Crear') }}</button>
        </div>
      </form>
    </div>
  `,
    styles: []
})
export class WebServiceFormComponent implements OnInit {
    public dialogRef = inject<MatDialogRef<WebServiceFormComponent>>(MatDialogRef);
    public data = inject<WebServiceDTO | null>(MAT_DIALOG_DATA);

    ws: WebServiceDTO = new WebServiceDTO();
    cargando = false;

    ngOnInit(): void {
        if (this.data) {
            this.ws = { ...this.data };
        } else {
            this.ws = new WebServiceDTO();
            this.ws.estado = 'A';
            this.ws.metodo = 'POST';
            this.ws.autenticacion = 'NONE';
            this.ws.timeout = 30;
            this.ws.reintentos = 3;
            this.ws.cabeceras = '{}';
            this.ws.parametros = '{}';
            this.ws.propiedades = [];
        }
    }

    onPropiedadesChange(props: any[]): void {
        this.ws.propiedades = props;
    }

    onSubmit(): void {
        this.cargando = true;
        this.dialogRef.close(this.ws);
    }
}