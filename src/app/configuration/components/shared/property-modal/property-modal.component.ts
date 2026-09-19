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
import { PropertyService, PropertyValueService } from 'app/configuration/configuracion.api';
import { PropertyRelationsComponent } from '../property-relations/property-relations.component';

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
    templateUrl: './property-modal.component.html',
    styleUrl: './property-modal.component.scss'
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
                //this.notificationCenter.fire('Error', 'No se pudo guardar la propiedad', 'error');
            }
        });
    }
}
