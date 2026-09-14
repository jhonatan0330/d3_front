import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { ProcesoDTO, ProcesoTransicionDTO } from 'app/document/document.types';
import { ProcessService } from '../configuracion.api';
import { PropertyPanelComponent } from '../shared/property-panel.component';
import { ProcessSelectorComponent } from '../shared/process-selector.component';
import { ProcessTransitionListComponent } from './process-transitions/process-transition-list.component';
import { ImageUploaderComponent } from '../../upload/image-uploader/image-uploader.component';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-process-form',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatTabsModule, MatIconModule, ProcessSelectorComponent, ProcessTransitionListComponent, ImageUploaderComponent],
    template: `
    <div class="bg-white dark:bg-gray-900 rounded-xl shadow-lg max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col">
      <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-xl font-bold">{{ data?.llaveTabla ? 'Editar Proceso' : 'Nuevo Proceso' }}</h2>
        <button type="button" class="btn-icon" (click)="dialogRef.close()"><mat-icon>close</mat-icon></button>
      </div>

      <form #form="ngForm" (ngSubmit)="onSubmit()">
        <mat-tab-group class="flex-1 overflow-hidden" [selectedIndex]="activeTab()">
          <!-- Tab General -->
          <mat-tab label="General">
            <div class="p-4 overflow-y-auto space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="sm:col-span-2">
                  <label class="block text-sm font-semibold mb-1">Nombre *</label>
                  <input type="text" [(ngModel)]="process.nombre" name="nombre" required class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label class="block text-sm font-semibold mb-1">Código *</label>
                  <input type="text" [(ngModel)]="process.codigo" name="codigo" required class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label class="block text-sm font-semibold mb-1">Tipo *</label>
                  <select [(ngModel)]="process.tipo" name="tipo" required class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="A">Agrupador</option>
                    <option value="E">Ejecutor</option>
                  </select>
                </div>
                <div class="sm:col-span-2">
                  <label class="block text-sm font-semibold mb-1">Objetivo</label>
                  <input type="text" [(ngModel)]="process.objetivo" name="objetivo" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div class="sm:col-span-2">
                  <label class="block text-sm font-semibold mb-1">Imagen</label>
                  <app-image-uploader [(value)]="process.imagen"></app-image-uploader>
                </div>
                <div>
                  <label class="block text-sm font-semibold mb-1">Prioridad</label>
                  <input type="number" [(ngModel)]="process.prioridad" name="prioridad" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label class="block text-sm font-semibold mb-1">Macro Proceso</label>
                  <app-process-selector [(ngModel)]="process.macroproceso" name="macroproceso" label=""></app-process-selector>
                </div>
                <div class="sm:col-span-2">
                  <label class="block text-sm font-semibold mb-1">Macro Nombre</label>
                  <input type="text" [(ngModel)]="process.macroNombre" name="macroNombre" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Tab Transiciones -->
          <mat-tab label="Transiciones ({{ process.transiciones?.length || 0 }})">
            <div class="p-4 h-full">
              <app-process-transition-list
                [processKey]="process.llaveTabla"
                [process]="process"
                (transitionSaved)="onTransitionSaved($event)">
              </app-process-transition-list>
            </div>
          </mat-tab>

        </mat-tab-group>

        <div class="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <button type="button" class="btn-flat" (click)="openPropiedades()" [disabled]="!process.llaveTabla"><mat-icon>tune</mat-icon> Propiedades</button>
          <button type="button" class="btn-flat" (click)="dialogRef.close()">Cancelar</button>
          <button type="submit" class="btn-flat-primary" [disabled]="cargando || !form.valid">{{ cargando ? 'Guardando...' : (data?.llaveTabla ? 'Actualizar' : 'Crear') }}</button>
        </div>
      </form>
    </div>
  `,
    styles: []
})
export class ProcessFormComponent implements OnInit {
    public dialogRef = inject<MatDialogRef<ProcessFormComponent>>(MatDialogRef);
    public data = inject<ProcesoDTO | null>(MAT_DIALOG_DATA);

    private service = inject(ProcessService);
    private dialog = inject(MatDialog);

    process: ProcesoDTO = new ProcesoDTO();
    cargando = false;
    activeTab = signal(0);

    ngOnInit(): void {
        if (this.data) {
            this.process = { ...this.data };
            if (!this.process.transiciones) this.process.transiciones = [];
        } else {
            this.process = new ProcesoDTO();
            this.process.estado = 'A';
            this.process.transiciones = [];
        }
    }

    openPropiedades(): void {
        if (!this.process.llaveTabla) return;
        this.dialog.open(PropertyPanelComponent, {
            width: '800px', maxWidth: '95vw', maxHeight: '90vh', disableClose: true,
            data: { campoKey: this.process.llaveTabla, tipoOrigen: 'P', titulo: this.process.nombre }
        });
    }

    onTransitionSaved(transition: ProcesoTransicionDTO): void {
        if (!this.process.transiciones) this.process.transiciones = [];
        const idx = this.process.transiciones.findIndex(t => t.llaveTabla === transition.llaveTabla);
        if (idx >= 0) this.process.transiciones[idx] = transition;
        else this.process.transiciones.push(transition);
    }

    onSubmit(): void {
        this.cargando = true;

        const request$ = this.process.llaveTabla
            ? this.service.updateProcess(this.process)
            : this.service.createProcess(this.process);

        request$.subscribe({
            next: (result) => {
                this.cargando = false;
                Swal.fire('Éxito', 'Proceso guardado correctamente', 'success');
                this.dialogRef.close(result);
            },
            error: (err) => {
                this.cargando = false;
                Swal.fire('Error', 'No se pudo guardar el proceso', 'error');
            }
        });
    }
}