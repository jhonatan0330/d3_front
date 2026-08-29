import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { RelacionInternaDTO } from 'app/document/model/sw42.domain';
import { PropertyService } from './property.service';

interface ModalData {
    relacion?: RelacionInternaDTO;
    propiedadKey: string;
}

@Component({
    selector: 'app-relation-form',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatFormFieldModule, MatSelectModule],
    template: `
    <div class="max-w-md w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 space-y-4">
      <h2 class="text-xl font-bold border-b border-gray-200 dark:border-gray-700 pb-2">
        {{ data.relacion?.llaveTabla ? 'Editar Relación' : 'Nueva Relación' }}
      </h2>

      <form #form="ngForm" (ngSubmit)="onSubmit()">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold mb-1">Campo</label>
            <mat-form-field appearance="outline" class="w-full">
              <mat-select [(ngModel)]="relacion.campo" name="campo" required>
                @for (c of camposDisponibles; track c.llaveTabla) {
                  <mat-option [value]="c.llaveTabla">{{ c.nombre }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>

          <div>
            <label class="block text-sm font-semibold mb-1">Plantilla</label>
            <mat-form-field appearance="outline" class="w-full">
              <mat-select [(ngModel)]="relacion.plantilla" name="plantilla" required>
                @for (p of plantillasDisponibles; track p.llaveTabla) {
                  <mat-option [value]="p.llaveTabla">{{ p.nombre }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>

          <div>
            <label class="block text-sm font-semibold mb-1">Auxiliar</label>
            <input type="text"
              [(ngModel)]="relacion.auxiliar"
              name="auxiliar"
              class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label class="block text-sm font-semibold mb-1">Fecha Inicio</label>
            <input type="date"
              [(ngModel)]="relacion.fechaInicio"
              name="fechaInicio"
              class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button type="button" class="btn-flat" (click)="dialogRef.close()">Cancelar</button>
          <button type="submit" class="btn-flat-primary" [disabled]="cargando || !form.valid">
            {{ cargando ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </form>
    </div>
  `,
    styles: []
})
export class RelationFormComponent implements OnInit {
    private propertyService = inject(PropertyService);
    public dialogRef = inject<MatDialogRef<RelationFormComponent>>(MatDialogRef);
    public data = inject<ModalData>(MAT_DIALOG_DATA);

    relacion: RelacionInternaDTO = new RelacionInternaDTO();
    camposDisponibles: { llaveTabla: string; nombre: string }[] = [];
    plantillasDisponibles: { llaveTabla: string; nombre: string }[] = [];
    cargando = false;

    ngOnInit(): void {
        if (this.data.relacion) {
            this.relacion = { ...this.data.relacion };
        } else {
            this.relacion = new RelacionInternaDTO();
            this.relacion.propiedad = this.data.propiedadKey;
            this.relacion.estado = 'A';
        }
        this.loadCatalogs();
    }

    loadCatalogs(): void {
        this.propertyService.getProperties({ estado: 'A' }).subscribe({
            next: (props) => {
                this.camposDisponibles = props.map(p => ({ llaveTabla: p.llaveTabla, nombre: p.nombre }));
            }
        });

        this.propertyService['http'].post<any[]>(
            this.propertyService['ls'].getUrlAccess('/api/config/document-templates/list', undefined),
            { estado: 'A' }
        ).subscribe({
            next: (templates) => {
                this.plantillasDisponibles = templates.map(t => ({ llaveTabla: t.llaveTabla, nombre: t.nombre }));
            }
        });
    }

    onSubmit(): void {
        this.cargando = true;

        const request$ = this.relacion.llaveTabla
            ? this.propertyService.updateRelation(this.relacion)
            : this.propertyService.createRelation(this.relacion);

        request$.subscribe({
            next: () => {
                this.cargando = false;
                this.dialogRef.close(this.relacion);
            },
            error: () => {
                this.cargando = false;
            }
        });
    }
}