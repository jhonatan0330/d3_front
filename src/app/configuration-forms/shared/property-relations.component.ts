import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RelacionInternaDTO, RelacionInternaFilterDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { PropertyService } from './property.service';
import { RelationFormComponent } from './relation-form.component';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-property-relations',
    standalone: true,
    imports: [CommonModule, MatIconModule, MatButtonModule, MatDialogModule, RelationFormComponent],
    template: `
    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-bold">Relaciones de Propiedad</h3>
        <button type="button"
          class="btn-flat-primary text-sm"
          (click)="openRelationModal()">
          <mat-icon class="text-sm">add</mat-icon>
          Agregar
        </button>
      </div>

      @if (cargando) {
        <div class="text-center py-4 text-gray-500 dark:text-gray-400">
          Cargando relaciones...
        </div>
      } @else if (relaciones.length === 0) {
        <div class="text-center text-sm text-gray-500 dark:text-gray-400 py-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          Sin relaciones configuradas
        </div>
      } @else {
        <div class="space-y-2 max-h-60 overflow-y-auto">
          @for (rel of relaciones; track rel.llaveTabla) {
            <div class="group border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800 hover:shadow-md transition relative">
              <div class="flex items-start justify-between">
                <div class="flex-1 min-w-0">
                  @if (rel.fechaInicio) {
                    <span class="text-xs text-gray-500 dark:text-gray-400 font-mono block mb-1">{{ rel.fechaInicio }}</span>
                  }
                  <h4 class="text-base font-semibold text-gray-900 dark:text-gray-100">{{ rel.campoNombre }}</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-300">{{ rel.plantillaNombre }}</p>
                </div>
                <div class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button type="button"
                    class="bg-blue-500 text-white text-xs px-2 py-1 rounded hover:bg-blue-600"
                    (click)="openRelationModal(rel)"
                    title="Editar relación">
                    <mat-icon class="text-sm">edit</mat-icon>
                  </button>
                  <button type="button"
                    class="bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600"
                    (click)="deleteRelation(rel)"
                    title="Eliminar relación">
                    <mat-icon class="text-sm">delete</mat-icon>
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
    styles: [`
    .btn-flat-primary {
      padding: 0.375rem 1rem;
      border-radius: 4px;
      font-weight: 500;
      background: #3f51b5;
      color: white;
      border: none;
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
    }
    .btn-flat-primary:hover {
      background: #303f9f;
    }
  `]
})
export class PropertyRelationsComponent implements OnInit {
    private propertyService = inject(PropertyService);
    private dialog = inject(MatDialog);

    @Input() propiedadKey!: string;
    @Input() propiedadEstado: string = 'A';

    relaciones: RelacionInternaDTO[] = [];
    cargando = false;

    ngOnInit(): void {
        this.loadRelations();
    }

    loadRelations(): void {
        this.cargando = true;
        const filter = new RelacionInternaFilterDTO();
        filter.propiedad = this.propiedadKey;
        filter.estado = this.propiedadEstado;

        this.propertyService.getRelations(filter).subscribe({
            next: (rels) => {
                this.relaciones = rels;
                this.cargando = false;
            },
            error: () => {
                this.relaciones = [];
                this.cargando = false;
            }
        });
    }

    openRelationModal(relacion?: RelacionInternaDTO): void {
        const dialogRef = this.dialog.open(RelationFormComponent, {
            width: '500px',
            maxWidth: '90vw',
            data: {
                relacion: relacion ? { ...relacion } : null,
                propiedadKey: this.propiedadKey
            }
        });

        dialogRef.afterClosed().subscribe((result: RelacionInternaDTO) => {
            if (result) {
                this.loadRelations();
            }
        });
    }

    deleteRelation(rel: RelacionInternaDTO): void {
        Swal.fire({
            title: '¿Eliminar relación?',
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.propertyService.inactivateRelation(rel).subscribe({
                    next: () => {
                        Swal.fire('Eliminado', 'Relación eliminada correctamente', 'success');
                        this.loadRelations();
                    },
                    error: () => {
                        Swal.fire('Error', 'No se pudo eliminar la relación', 'error');
                    }
                });
            }
        });
    }
}