import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ProcesoDTO, ProcesoTransicionDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { PropertyFieldComponent } from '../../shared/property-field.component';
import Swal from 'sweetalert2';

interface TransitionFormData {
    transition?: ProcesoTransicionDTO;
    process: ProcesoDTO;
}

@Component({
    selector: 'app-process-transition-form',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatCheckboxModule, PropertyFieldComponent],
    template: `
    <div class="max-w-2xl w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
      <h2 class="text-xl font-bold border-b border-gray-200 dark:border-gray-700 pb-2">
        {{ data.transition?.llaveTabla ? 'Editar Transición' : 'Nueva Transición' }}
      </h2>

      <form #form="ngForm" (ngSubmit)="onSubmit()">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold mb-1">Nombre *</label>
            <input type="text" [(ngModel)]="transition.nombre" name="nombre" required class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold mb-1">Estado Origen *</label>
              <input type="text" [(ngModel)]="transition.estadoPartida" name="estadoPartida" required class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Llave del estado origen" />
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1">Estado Origen Nombre</label>
              <input type="text" [(ngModel)]="transition.estadoPartidaNombre" name="estadoPartidaNombre" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold mb-1">Estado Destino *</label>
              <input type="text" [(ngModel)]="transition.estadoLLegada" name="estadoLLegada" required class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Llave del estado destino" />
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1">Estado Destino Nombre</label>
              <input type="text" [(ngModel)]="transition.estadoLlegadaNombre" name="estadoLlegadaNombre" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold mb-1">Plantilla</label>
            <input type="text" [(ngModel)]="transition.plantilla" name="plantilla" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Llave de la plantilla" />
          </div>

          <div>
            <label class="block text-sm font-semibold mb-1">Plantilla Nombre</label>
            <input type="text" [(ngModel)]="transition.plantillaNombre" name="plantillaNombre" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold mb-1">Orden Partida</label>
              <input type="number" [(ngModel)]="transition.estadoPartidaOrden" name="estadoPartidaOrden" min="0" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1">Orden Llegada</label>
              <input type="number" [(ngModel)]="transition.estadoLlegadaOrden" name="estadoLlegadaOrden" min="0" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div class="flex items-center gap-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" [(ngModel)]="transition.documentador" name="documentador" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
              <span class="text-sm">Documentador</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" [(ngModel)]="transition.rapida" name="rapida" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
              <span class="text-sm">Transición Rápida</span>
            </label>
          </div>

          <div>
            <label class="block text-sm font-semibold mb-1">Afecta Saldo</label>
            <input type="text" [(ngModel)]="transition.afectaSaldo" name="afectaSaldo" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="SI/NO" />
          </div>

          <div>
            <label class="block text-sm font-semibold mb-1">Imagen (URL)</label>
            <input type="text" [(ngModel)]="transition.imagen" name="imagen" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label class="block text-sm font-semibold mb-1">Tipo Llegada</label>
            <input type="text" [(ngModel)]="transition.estadoLlegadaTipo" name="estadoLlegadaTipo" class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <app-property-field
            [propiedades]="transition.propiedades || []"
            [tipoOrigen]="'T'"
            [campoKey]="transition.llaveTabla || ''"
            (propiedadesChange)="onPropiedadesChange($event)">
          </app-property-field>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button type="button" class="btn-flat" (click)="dialogRef.close()">Cancelar</button>
          <button type="submit" class="btn-flat-primary" [disabled]="cargando || !form.valid">{{ cargando ? 'Guardando...' : (data.transition?.llaveTabla ? 'Actualizar' : 'Crear') }}</button>
        </div>
      </form>
    </div>
  `,
    styles: [`
    .btn-flat { padding: 0.5rem 1.5rem; border-radius: 4px; font-weight: 500; border: 1px solid #e0e0e0; background: white; color: #333; }
    .btn-flat:hover { background: #f5f5f5; }
    .btn-flat-primary { padding: 0.5rem 1.5rem; border-radius: 4px; font-weight: 500; background: #3f51b5; color: white; border: none; }
    .btn-flat-primary:hover:not(:disabled) { background: #303f9f; }
    .btn-flat-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    :host ::ng-deep .mat-form-field { width: 100%; }
  `]
})
export class ProcessTransitionFormComponent implements OnInit {
    public dialogRef = inject<MatDialogRef<ProcessTransitionFormComponent>>(MatDialogRef);
    public data = inject<TransitionFormData>(MAT_DIALOG_DATA);

    transition: ProcesoTransicionDTO = new ProcesoTransicionDTO();
    cargando = false;

    ngOnInit(): void {
        if (this.data.transition) {
            this.transition = { ...this.data.transition };
        } else {
            this.transition = new ProcesoTransicionDTO();
            this.transition.estado = 'A';
            this.transition.proceso = this.data.process.llaveTabla;
            this.transition.documentador = false;
            this.transition.rapida = false;
            this.transition.estadoPartidaOrden = 0;
            this.transition.estadoLlegadaOrden = 0;
            this.transition.propiedades = [];
        }
    }

    onPropiedadesChange(props: any[]): void {
        this.transition.propiedades = props;
    }

    onSubmit(): void {
        this.cargando = true;
        this.dialogRef.close(this.transition);
    }
}