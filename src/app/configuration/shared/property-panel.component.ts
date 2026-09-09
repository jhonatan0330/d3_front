import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { PropiedadDTO, PropiedadCampoDTO } from 'app/shared/shared.domain';
import { PropertyService } from '../configuracion.api';
import { PropertyModalComponent } from './property-modal.component';
import Swal from 'sweetalert2';

interface PropertyPanelData {
    campoKey: string;
    tipoOrigen: string;
    titulo: string;
    origenCategoria?: string;
}

@Component({
    selector: 'app-property-panel',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatIconModule],
    template: `
    <div class=" w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 space-y-4">
      <div class="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
        <h2 class="text-xl font-bold">Propiedades de {{ data.titulo }}</h2>
        <button type="button" class="btn-icon" (click)="dialogRef.close()" aria-label="Cerrar"><mat-icon>close</mat-icon></button>
      </div>

      <div class="flex justify-end">
        <button type="button" class="btn-flat-primary" (click)="openModal()">
          <mat-icon class="text-base">add</mat-icon>
          Nueva Propiedad
        </button>
      </div>

      @if (loading()) {
        <div class="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
          <div class="h-full bg-primary rounded animate-pulse" style="width: 40%;"></div>
        </div>
      } @else if (propiedades().length === 0) {
        <div class="text-center text-sm text-gray-500 dark:text-gray-400 py-6 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          Sin propiedades configuradas
        </div>
      } @else {
        <div class="space-y-2 max-h-96 overflow-y-auto">
          @for (prop of propiedades(); track prop.llaveTabla) {
            <div class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <p class="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{{ prop.nombre }}</p>
                  <span class="text-xs font-mono text-gray-500 dark:text-gray-400 shrink-0">{{ prop.key }}</span>
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ prop.texto || prop.valor }}</p>
                <p class="text-xs text-gray-400 dark:text-gray-500 truncate">{{ prop.motivo }}</p>
              </div>
              <div class="flex items-center gap-1">
                <button type="button" class="btn-icon btn-flat-primary" (click)="openModal(prop)" title="Editar propiedad" aria-label="Editar propiedad">
                  <mat-icon>edit</mat-icon>
                </button>
                <button type="button" class="btn-icon btn-flat-accent" (click)="inactivar(prop)" title="Anular propiedad" aria-label="Anular propiedad">
                  <mat-icon>block</mat-icon>
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
    styles: []
})
export class PropertyPanelComponent implements OnInit {
    private propertyService = inject(PropertyService);
    private dialog = inject(MatDialog);
    public dialogRef = inject<MatDialogRef<PropertyPanelComponent>>(MatDialogRef);
    public data = inject<PropertyPanelData>(MAT_DIALOG_DATA);

    loading = signal(false);
    propiedades = signal<PropiedadDTO[]>([]);

    ngOnInit(): void {
        this.loadPropiedades();
    }

    loadPropiedades(): void {
        this.loading.set(true);
        this.propertyService.getProperties({ campo: this.data.campoKey, estado: 'A' }).subscribe({
            next: (props) => { this.propiedades.set(props); this.loading.set(false); },
            error: () => { this.propiedades.set([]); this.loading.set(false); }
        });
    }

    openModal(propiedad?: PropiedadDTO): void {
        const dialogRef = this.dialog.open(PropertyModalComponent, {
            width: '600px',
            maxWidth: '90vw',
            data: {
                propiedad: propiedad ? this.toPropiedadCampo(propiedad) : null,
                tipoOrigen: this.data.tipoOrigen,
                origenCategoria: this.data.origenCategoria || '',
                campoKey: this.data.campoKey
            }
        });

        dialogRef.afterClosed().subscribe((result: PropiedadCampoDTO) => {
            if (result) {
                this.loadPropiedades();
            }
        });
    }

    inactivar(prop: PropiedadDTO): void {
        Swal.fire({
            title: '¿Anular propiedad?',
            text: `Se anulará la propiedad ${prop.nombre}. Esta acción no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, anular',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.propertyService.inactivateProperty(prop).subscribe({
                    next: () => {
                        Swal.fire('Anulada', 'Propiedad anulada correctamente', 'success');
                        this.loadPropiedades();
                    },
                    error: () => {
                        Swal.fire('Error', 'No se pudo anular la propiedad', 'error');
                    }
                });
            }
        });
    }

    private toPropiedadCampo(prop: PropiedadDTO): PropiedadCampoDTO {
        const pc = new PropiedadCampoDTO();
        pc.llaveTabla = prop.llaveTabla;
        pc.propiedadValor = prop.propiedadValor;
        pc.tipo = prop.tipo;
        pc.nombre = prop.nombre;
        pc.key = prop.key;
        pc.campo = prop.campo;
        pc.valor = Number(prop.valor) || 0;
        pc.texto = prop.texto || '';
        pc.motivo = prop.motivo || '';
        pc.relaciones = prop.relaciones || 0;
        pc.estado = prop.estado || 'A';
        return pc;
    }
}