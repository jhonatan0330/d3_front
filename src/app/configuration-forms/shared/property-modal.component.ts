import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PropiedadCampoDTO, PropiedadValorDefinidoDTO, RelacionInternaDTO, RelacionInternaFilterDTO, UsuarioDTO, RolAccesoFilterDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { PropertyService } from './property.service';
import { PropertyRelationsComponent } from './property-relations.component';
import Swal from 'sweetalert2';

interface ModalData {
    propiedad?: PropiedadCampoDTO;
    tipoOrigen: string;
    origenCategoria?: string;
    campoKey?: string;
}

@Component({
    selector: 'app-property-modal',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatIconModule,
        MatSelectModule,
        MatInputModule,
        MatButtonModule,
        MatFormFieldModule,
        MatCheckboxModule,
        PropertyRelationsComponent
    ],
    template: `
    <div class="max-w-2xl w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 space-y-4">
      <h2 class="text-xl font-bold border-b border-gray-200 dark:border-gray-700 pb-2">
        {{ data.propiedad?.llaveTabla ? 'Editar Propiedad' : 'Nueva Propiedad' }}
      </h2>

      <form #form="ngForm" (ngSubmit)="onSubmit()">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold mb-1">Propiedad Valor</label>
            <mat-form-field appearance="outline" class="w-full">
              <mat-select [(ngModel)]="propiedad.propiedadValor" name="propiedadValor" required>
                @for (pv of propiedadValores; track pv.llaveTabla) {
                  <mat-option [value]="pv.llaveTabla">{{ pv.nombre }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>

          @if (def) {
            @if (def.pideRol) {
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold mb-1">Rol</label>
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-select [(ngModel)]="propiedad.rol" name="rol">
                      @for (r of roles; track r.llaveTabla) {
                        <mat-option [value]="r.llaveTabla">{{ r.nombre }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>
                </div>
                <div>
                  <label class="block text-sm font-semibold mb-1">Rol Excluyente</label>
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-select [(ngModel)]="propiedad.rolExcluyente" name="rolExcluyente">
                      @for (r of roles; track r.llaveTabla) {
                        <mat-option [value]="r.llaveTabla">{{ r.nombre }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>
                </div>
              </div>
            }

            @if (def.pideUsuario) {
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <app-user-selector
                  label="Usuario"
                  [(ngModel)]="propiedad.usuario"
                  [ngModelOptions]="{ standalone: true }"
                  (usuarioSelected)="onUsuarioSelected($event)">
                </app-user-selector>
                <app-user-selector
                  label="Usuario Excluyente"
                  [(ngModel)]="propiedad.usuarioExcluyente"
                  [ngModelOptions]="{ standalone: true }"
                  (usuarioSelected)="onUsuarioExcluyenteSelected($event)">
                </app-user-selector>
              </div>
            }

            @if (def.pideFechas) {
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold mb-1">Fecha inicial</label>
                  <input type="datetime-local"
                    [(ngModel)]="propiedad.fechaInicial"
                    name="fechaInicial"
                    class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label class="block text-sm font-semibold mb-1">Fecha final</label>
                  <input type="datetime-local"
                    [(ngModel)]="propiedad.fechaFinal"
                    name="fechaFinal"
                    class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            }

            @if (def.pideTiempoBloqueo) {
              <div>
                <label class="block text-sm font-semibold mb-1">Tiempo de bloqueo (minutos)</label>
                <input type="number" min="0" step="1"
                  [(ngModel)]="propiedad.bloqueo"
                  name="bloqueo"
                  class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            }

            @if (!def.necesitaDesarrollo && !def.propiedadBoolean) {
              <div>
                <label class="block text-sm font-semibold mb-1">Valor</label>
                <textarea rows="3"
                  [(ngModel)]="propiedad.valor"
                  name="valor"
                  class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
              </div>
            }

            @if (!def.necesitaDesarrollo && !def.propiedadBoolean && !def.textOculto) {
              <div>
                <label class="block text-sm font-semibold mb-1">Texto</label>
                <input type="text"
                  [(ngModel)]="propiedad.texto"
                  name="texto"
                  class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            }

            <div>
              <label class="block text-sm font-semibold mb-1">Motivo</label>
              <textarea rows="3"
                [(ngModel)]="propiedad.motivo"
                name="motivo"
                class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
            </div>
          }
        </div>

        @if (def && propiedad.llaveTabla) {
          <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
            <app-property-relations
              [propiedadKey]="propiedad.llaveTabla"
              [propiedadEstado]="propiedad.estado">
            </app-property-relations>
          </div>
        }

        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button type="button"
            class="btn-flat"
            (click)="dialogRef.close()">
            Cancelar
          </button>
          <button type="submit"
            class="btn-flat-primary"
            [disabled]="cargando || !form.valid">
            {{ cargando ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </form>
    </div>
  `,
    styles: [`
    .btn-flat {
      padding: 0.5rem 1.5rem;
      border-radius: 4px;
      font-weight: 500;
      border: 1px solid #e0e0e0;
      background: white;
      color: #333;
    }
    .btn-flat:hover {
      background: #f5f5f5;
    }
    .btn-flat-primary {
      padding: 0.5rem 1.5rem;
      border-radius: 4px;
      font-weight: 500;
      background: #3f51b5;
      color: white;
      border: none;
    }
    .btn-flat-primary:hover:not(:disabled) {
      background: #303f9f;
    }
    .btn-flat-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    :host ::ng-deep .mat-form-field-appearance-outline .mat-form-field-outline {
      color: #e0e0e0;
    }
    :host ::ng-deep .mat-form-field-appearance-outline.mat-focused .mat-form-field-outline-thick {
      color: #3f51b5;
    }
  `]
})
export class PropertyModalComponent implements OnInit {
    private propertyService = inject(PropertyService);
    public dialogRef = inject<MatDialogRef<PropertyModalComponent>>(MatDialogRef);
    public data = inject<ModalData>(MAT_DIALOG_DATA);

    propiedad: PropiedadCampoDTO = new PropiedadCampoDTO();
    propiedadValores: PropiedadValorDefinidoDTO[] = [];
    roles: RolAccesoFilterDTO[] = [];
    def: PropiedadValorDefinidoDTO | null = null;
    cargando = false;

    ngOnInit(): void {
        if (this.data.propiedad) {
            this.propiedad = { ...this.data.propiedad };
            this.propiedad.campo = this.data.campoKey || this.data.propiedad.campo;
            this.propiedad.tipo = this.data.tipoOrigen;
        } else {
            this.propiedad = new PropiedadCampoDTO();
            this.propiedad.campo = this.data.campoKey || '';
            this.propiedad.tipo = this.data.tipoOrigen;
            this.propiedad.valor = 1;
            this.propiedad.estado = 'A';
        }

        this.loadPropertyValues();
    }

    loadPropertyValues(): void {
        const filter = new PropiedadValorDefinidoDTO();
        filter.origen = this.propiedad.tipo;
        filter.origenCategoria = this.data.origenCategoria || '';

        this.propertyService['http'].post<PropiedadValorDefinidoDTO[]>(
            this.propertyService['ls'].getUrlAccess('/api/config/property-values/by-origen', undefined),
            filter
        ).subscribe({
            next: (vals) => {
                this.propiedadValores = vals;
                if (this.propiedad.propiedadValor) {
                    this.onPropiedadValorChange(this.propiedad.propiedadValor);
                }
            },
            error: () => {}
        });
    }

    onPropiedadValorChange(llave: string): void {
        this.def = this.propiedadValores.find(p => p.llaveTabla === llave) || null;
        if (this.def?.pideRol) {
            this.loadRoles();
        }
    }

    loadRoles(): void {
        this.propertyService['http'].post<RolAccesoFilterDTO[]>(
            this.propertyService['ls'].getUrlAccess('/api/config/roles/list', undefined),
            { estado: 'A' }
        ).subscribe({
            next: (roles) => this.roles = roles,
            error: () => {}
        });
    }

    onUsuarioSelected(usuario: UsuarioDTO): void {
        this.propiedad.usuario = usuario.llaveTabla;
    }

    onUsuarioExcluyenteSelected(usuario: UsuarioDTO): void {
        this.propiedad.usuarioExcluyente = usuario.llaveTabla;
    }

    onSubmit(): void {
        this.cargando = true;

        const request$ = this.propiedad.llaveTabla
            ? this.propertyService.updateProperty(this.propiedad)
            : this.propertyService.createProperty(this.propiedad);

        request$.subscribe({
            next: (result) => {
                this.cargando = false;
                this.dialogRef.close(this.propiedad);
            },
            error: (err) => {
                this.cargando = false;
                Swal.fire('Error', 'No se pudo guardar la propiedad', 'error');
            }
        });
    }
}