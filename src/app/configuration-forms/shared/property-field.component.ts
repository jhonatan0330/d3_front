import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { PropiedadDTO, PropiedadCampoDTO } from 'app/shared/shared.domain';
import { PropertyModalComponent } from './property-modal.component';

@Component({
    selector: 'app-property-field',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatIconModule],
    template: `
    <div class="space-y-2">
      <div class="flex items-center justify-between mb-2">
        <h4 class="font-medium text-gray-900 dark:text-gray-100">Propiedades</h4>
        <button
          type="button"
          class="btn-icon btn-flat-primary"
          (click)="openModal()"
          aria-label="Agregar propiedad">
          <mat-icon>add</mat-icon>
        </button>
      </div>

      @if (propiedades.length === 0) {
        <div class="text-center text-sm text-gray-500 dark:text-gray-400 py-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          Sin propiedades configuradas
        </div>
      } @else {
        <div class="space-y-2 max-h-60 overflow-y-auto">
          @for (prop of propiedades; track prop.llaveTabla) {
            <div class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div class="flex-1 min-w-0">
                <p class="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{{ prop.nombre || prop.propiedadValor }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ prop.texto || prop.valor }}</p>
              </div>
              <div class="flex items-center gap-1">
                <button
                  type="button"
                  class="btn-icon btn-flat-primary"
                  (click)="openModal(prop)"
                  aria-label="Editar propiedad">
                  <mat-icon>edit</mat-icon>
                </button>
                <button
                  type="button"
                  class="btn-icon btn-flat-accent"
                  (click)="removeProperty(prop)"
                  aria-label="Eliminar propiedad">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
    styles: [`
    .btn-icon {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }
    .btn-flat-primary {
      background-color: #3f51b5;
      color: white;
    }
    .btn-flat-primary:hover {
      background-color: #303f9f;
    }
    .btn-flat-accent {
      background-color: #f44336;
      color: white;
    }
    .btn-flat-accent:hover {
      background-color: #d32f2f;
    }
  `]
})
export class PropertyFieldComponent {
    private dialog = inject(MatDialog);

    @Input() propiedades: PropiedadDTO[] = [];
    @Input() tipoOrigen: string = 'C';
    @Input() origenCategoria: string = '';
    @Input() campoKey: string = '';

    @Output() propiedadesChange = new EventEmitter<PropiedadDTO[]>();

    openModal(propiedad?: PropiedadDTO): void {
        const dialogRef = this.dialog.open(PropertyModalComponent, {
            width: '600px',
            maxWidth: '90vw',
            data: {
                propiedad: propiedad ? this.toPropiedadCampo(propiedad) : null,
                tipoOrigen: this.tipoOrigen,
                origenCategoria: this.origenCategoria,
                campoKey: this.campoKey
            }
        });

        dialogRef.afterClosed().subscribe((result: PropiedadCampoDTO) => {
            if (result) {
                this.handleResult(result);
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

    private handleResult(result: PropiedadCampoDTO): void {
        const newProp: PropiedadDTO = {
            llaveTabla: result.llaveTabla || '',
            estado: result.estado || 'A',
            propiedadValor: result.propiedadValor,
            tipo: result.tipo,
            nombre: result.nombre,
            key: result.key,
            campo: result.campo,
            valor: String(result.valor),
            texto: result.texto || '',
            motivo: result.motivo || '',
            relaciones: result.relaciones || 0
        };

        if (result.llaveTabla) {
            const idx = this.propiedades.findIndex(p => p.llaveTabla === result.llaveTabla);
            if (idx >= 0) {
                this.propiedades[idx] = newProp;
            } else {
                this.propiedades.push(newProp);
            }
        } else {
            this.propiedades.push(newProp);
        }

        this.propiedadesChange.emit([...this.propiedades]);
    }

    removeProperty(prop: PropiedadDTO): void {
        if (confirm('¿Eliminar esta propiedad?')) {
            this.propiedades = this.propiedades.filter(p => p.llaveTabla !== prop.llaveTabla);
            this.propiedadesChange.emit([...this.propiedades]);
        }
    }
}