import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { PropiedadCampoDTO, PropiedadDTO, PropiedadValorDefinidoDTO, RelacionInternaDTO, RelacionInternaFilterDTO } from 'app/shared/shared.domain';
import { UsuarioDTO, RolAccesoFilterDTO } from 'app/authentication/authentication.domain';
import { PropertyService, PropertyValueService } from '../configuracion.api';
import { PropertyRelationsComponent } from './property-relations.component';
import Swal from 'sweetalert2';

interface ModalData {
    propiedad?: PropiedadCampoDTO;
    propiedadId?: string;
    tipoOrigen?: string;
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
        MatFormFieldModule,
        MatInputModule,
        MatAutocompleteModule,
        PropertyRelationsComponent
    ],
    template: `
    <div class=" w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 space-y-4">
      <div class="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
        <h2 class="text-xl font-bold">{{ esEdicion ? 'Editar Propiedad' : 'Nueva Propiedad' }}</h2>
        <button type="button" class="btn-icon" (click)="dialogRef.close()" aria-label="Cerrar" title="Cerrar"><mat-icon>close</mat-icon></button>
      </div>

      @if (inicializando()) {
        <div class="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
          <div class="h-full bg-primary rounded animate-pulse" style="width: 40%;"></div>
        </div>
      }

      <form #form="ngForm" (ngSubmit)="onSubmit()">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold mb-1">Propiedad Valor</label>
            <mat-form-field appearance="outline" class="w-full">
              <input type="text" matInput
                placeholder="Buscar por código o nombre"
                [ngModel]="propiedadValorTexto"
                name="propiedadValorTexto"
                (ngModelChange)="onPropiedadValorTextoChange($event)"
                [matAutocomplete]="auto"
                required />
              <mat-autocomplete #auto="matAutocomplete"
                [displayWith]="displayPropiedadValor"
                (optionSelected)="onPropiedadValorOption($event)">
                @for (pv of propiedadValoresFiltrados; track pv.llaveTabla) {
                  <mat-option [value]="pv">{{ pv.codigo }} - {{ pv.nombre }}</mat-option>
                }
              </mat-autocomplete>
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

            @if (def.usoMotivo) {
              <div>
                <label class="block text-sm font-semibold mb-1">{{ def.usoMotivo }}</label>
                <textarea rows="3"
                  [(ngModel)]="propiedad.motivo"
                  name="motivo"
                  class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
              </div>
            }
          }
        </div>

        @if (def && def.usoRelaciones && propiedad.llaveTabla) {
          <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
            <app-property-relations
              [propiedadKey]="propiedad.llaveTabla"
              [propiedadEstado]="propiedad.estado"
              [titulo]="def.usoRelaciones">
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
            [disabled]="cargando() || !form.valid">
            {{ cargando() ? 'Guardando...' : 'Guardar' }}
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
    private propertyValueService = inject(PropertyValueService);
    public dialogRef = inject<MatDialogRef<PropertyModalComponent>>(MatDialogRef);
    public data = inject<ModalData>(MAT_DIALOG_DATA);

    propiedad: PropiedadCampoDTO = new PropiedadCampoDTO();
    propiedadValores: PropiedadValorDefinidoDTO[] = [];
    propiedadValoresFiltrados: PropiedadValorDefinidoDTO[] = [];
    propiedadValorTexto: string = '';
    roles: RolAccesoFilterDTO[] = [];
    def: PropiedadValorDefinidoDTO | null = null;
    cargando = signal(false);
    inicializando = signal(false);
    esEdicion = false;

    private valoresCargados = false;
    private propiedadCargada = false;

    ngOnInit(): void {
        const contexto = this.data.propiedad
            ? { ...this.data.propiedad }
            : new PropiedadCampoDTO();

        const propiedadId = this.data.propiedadId || contexto.llaveTabla || null;

        this.propiedad = new PropiedadCampoDTO();
        this.propiedad.campo = this.data.campoKey || contexto.campo || '';
        this.propiedad.tipo = this.data.tipoOrigen || contexto.tipo || '';
        this.propiedad.estado = 'A';

        if (propiedadId) {
            this.esEdicion = true;
            this.propiedad.llaveTabla = propiedadId;
            this.inicializando.set(true);
            this.loadPropiedad(propiedadId);
        } else {
            this.propiedadCargada = true;
        }

        this.loadPropertyValues();
    }

    loadPropiedad(id: string): void {
        this.propertyService.getPropertyById(id).subscribe({
            next: (prop) => {
                this.applyServerPropiedad(prop);
                this.propiedadCargada = true;
                this.inicializando.set(false);
                this.aplicarSeleccion();
            },
            error: () => {
                this.propiedadCargada = true;
                this.inicializando.set(false);
                this.aplicarSeleccion();
            }
        });
    }

    private applyServerPropiedad(prop: PropiedadDTO): void {
        const pc = new PropiedadCampoDTO();
        pc.llaveTabla = prop.llaveTabla;
        pc.estado = prop.estado || 'A';
        pc.campo = this.data.campoKey || prop.campo || '';
        pc.tipo = this.data.tipoOrigen || prop.tipo || '';
        pc.propiedadValor = prop.propiedadValor || '';
        pc.nombre = prop.nombre || '';
        pc.key = prop.key || '';
        pc.valor = prop.valor || '';
        pc.texto = prop.texto || '';
        pc.motivo = prop.motivo || '';
        pc.relaciones = prop.relaciones || 0;
        pc.imagen = prop.imagen || '';
        pc.rol = prop.rol || '';
        pc.rolNombre = prop.rolNombre || '';
        pc.rolExcluyente = prop.rolExcluyente || '';
        pc.rolExcluyenteNombre = prop.rolExcluyenteNombre || '';
        pc.usuario = prop.usuario || '';
        pc.usuarioNombre = prop.usuarioNombre || '';
        pc.usuarioExcluyente = prop.usuarioExcluyente || '';
        pc.usuarioExcluyenteNombre = prop.usuarioExcluyenteNombre || '';
        pc.fechaInicial = prop.fechaInicial || '';
        pc.fechaFinal = prop.fechaFinal || '';
        pc.bloqueo = prop.bloqueo || '';
        pc.fechaDefinicion = prop.fechaDefinicion || null;
        pc.fechaImplementacion = prop.fechaImplementacion || null;
        this.propiedad = pc;
    }

    loadPropertyValues(): void {
        this.propertyValueService.getByOrigen(this.propiedad.tipo, this.data.origenCategoria).subscribe({
            next: (vals) => {
                this.propiedadValores = vals;
                this.propiedadValoresFiltrados = [...vals];
                this.valoresCargados = true;
                this.aplicarSeleccion();
            },
            error: () => {
                this.valoresCargados = true;
                this.aplicarSeleccion();
            }
        });
    }

    private aplicarSeleccion(): void {
        if (!this.valoresCargados || !this.propiedadCargada) return;
        if (this.propiedad.propiedadValor) {
            const pv = this.propiedadValores.find(p => p.llaveTabla === this.propiedad.propiedadValor);
            if (pv) {
                this.propiedadValorTexto = this.displayPropiedadValor(pv);
            }
            this.onPropiedadValorChange(this.propiedad.propiedadValor);
        }
    }

    displayPropiedadValor(pv: PropiedadValorDefinidoDTO | string | null): string {
        if (!pv) return '';
        if (typeof pv === 'string') return pv;
        return `${pv.codigo} - ${pv.nombre}`;
    }

    onPropiedadValorTextoChange(texto: string | PropiedadValorDefinidoDTO | null): void {
        if (typeof texto !== 'string') {
            this.propiedadValoresFiltrados = [...this.propiedadValores];
            return;
        }
        const t = texto.trim().toLowerCase();
        this.propiedadValoresFiltrados = t
            ? this.propiedadValores.filter(pv =>
                (pv.codigo || '').toLowerCase().includes(t) ||
                (pv.nombre || '').toLowerCase().includes(t))
            : [...this.propiedadValores];
        const seleccion = this.propiedadValores.find(p => p.llaveTabla === this.propiedad.propiedadValor);
        if (!seleccion || this.displayPropiedadValor(seleccion) !== texto.trim()) {
            this.propiedad.propiedadValor = '';
            this.def = null;
        }
    }

    onPropiedadValorOption(event: MatAutocompleteSelectedEvent): void {
        const pv = event.option.value as PropiedadValorDefinidoDTO;
        if (!pv) return;
        this.propiedad.propiedadValor = pv.llaveTabla;
        this.propiedadValorTexto = this.displayPropiedadValor(pv);
        this.onPropiedadValorChange(pv.llaveTabla);
    }

    onPropiedadValorChange(llave: string): void {
        this.def = this.propiedadValores.find(p => p.llaveTabla === llave) || null;
        if (this.def?.pideRol) {
            this.loadRoles();
        }
    }

    loadRoles(): void {
        this.propertyService.getRoles().subscribe({
            next: (roles) => this.roles = roles,
            error: () => {}
        });
    }

    onUsuarioSelected(usuario: UsuarioDTO | Event): void {
        if (usuario instanceof Event) return;
        this.propiedad.usuario = usuario.llaveTabla;
    }

    onUsuarioExcluyenteSelected(usuario: UsuarioDTO | Event): void {
        if (usuario instanceof Event) return;
        this.propiedad.usuarioExcluyente = usuario.llaveTabla;
    }

    onSubmit(): void {
        this.cargando.set(true);

        const request$ = this.propiedad.llaveTabla
            ? this.propertyService.updateProperty(this.propiedad)
            : this.propertyService.createProperty(this.propiedad);

        request$.subscribe({
            next: (result) => {
                this.cargando.set(false);
                this.dialogRef.close(this.propiedad);
            },
            error: (err) => {
                this.cargando.set(false);
                //Swal.fire('Error', 'No se pudo guardar la propiedad', 'error');
            }
        });
    }
}