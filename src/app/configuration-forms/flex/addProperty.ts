import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { propiedadCampo, PropiedadCampoDTO, RelacionInternaDTO, RelacionInternaFilterDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { PropiedadValorDefinidoDTO } from 'app/shared/shared.domain';
import { FlexService } from '../flex.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { RolAccesoFilterDTO, UsuarioDTO } from 'app/authentication/authentication.domain';
import { ApiErrorResponse } from 'app/modules/full/neuron/model/sw42.utils';


@Component({
    selector: 'app-property-form',
    templateUrl: './addProperty.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormsModule]
})
export class AddPropertyComponent {
    private flexService = inject(FlexService);
    data = inject(MAT_DIALOG_DATA);
    dialogRef = inject<MatDialogRef<AddPropertyComponent>>(MatDialogRef);

    cargando = false;

    //propiedad : PropiedadValorDefinidoDTO; PropiedadCampoDTO
    propiedad: PropiedadCampoDTO;

    propiedadValores: PropiedadValorDefinidoDTO[];
    roles: RolAccesoFilterDTO[];
    usuarios: UsuarioDTO[];

    propiedadesRelacion: RelacionInternaDTO[] = [];
    def: PropiedadValorDefinidoDTO | null = null;

    filtroUsuario = '';
    filtroUsuarioExcluyente = '';
    buscandoUsuario = false;
    buscandoUsuarioExcluyente = false;

    private debounceTimer: any;

    onPropiedadValorChange(llaveSeleccionada: string): void {
        this.def = this.propiedadValores.find(p => p.llaveTabla === llaveSeleccionada)!;
        if (this.def.pideRol) {
            this.buscarRoles();
        }
        this.propiedad = new PropiedadCampoDTO;
        this.propiedad.campo = this.data.template;
        this.propiedad.tipo = this.data.tipo.origen;
        this.propiedad.valor = 1;
        this.propiedad.propiedadValor = llaveSeleccionada;
    }


    onUsuarioInputChange() {
        this.buscandoUsuario = true;
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.filtrarUsuarios(this.filtroUsuario);
        }, 200);
    }

    onUsuarioExcluyenteInputChange() {
        this.buscandoUsuarioExcluyente = true;
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.filtrarUsuarios(this.filtroUsuarioExcluyente);
        }, 200);
    }
    ngOnInit(): void {
        if (this.data.propiedad) {
            this.propiedad = this.data.propiedad;
            this.listarRelacionesPropiedad();
        } else {
            this.propiedad = new PropiedadCampoDTO;
            this.buscarRoles();
            this.propiedad.campo = this.data.template;
            this.propiedad.tipo = this.data.tipo.origen;
            this.propiedad.valor = 1;
        }
        this.buscarPropiedades();

    }

    buscarPropiedades() {
        const _a = new PropiedadValorDefinidoDTO();
        _a.origen = this.propiedad.tipo;
        _a.origenCategoria = this.data.tipo.origenCategoria;
        this.flexService.listarPorOrigenPropiedadValorDefinido(_a, null!)
            .subscribe({ next: p => {
                this.propiedadValores = p;
                this.def = this.propiedadValores.find(p => p.llaveTabla === this.propiedad.propiedadValor)!;
                if (this.def.pideRol) {
                    this.buscarRoles();
                }

            }, error: () => {} });
    }
    buscarRoles() {
        this.flexService.listarConsultaRolAcceso().subscribe({ next: p => {
            this.roles = p;
            if(!this.propiedad.llaveTabla){
                this.propiedad.rol = null as any;
                this.propiedad.rolExcluyente = null as any;
            }
        }, error: () => {} })
    }

    guardarPropiedad() {
        this.cargando = true;
        if(this.propiedad.llaveTabla){
            this.flexService.changeProperty(this.propiedad).subscribe({
            next: (result: ApiErrorResponse) => {
                if (result?.message) {
                    Swal.fire('Error', 'No se pudo cambiar la propiedad ' + result.message, 'error');
                    return;
                }
                this.cargando = false;
                this.dialogRef.close(true);
            },
            error: error => {
                Swal.fire('Error', 'No se pudo cambiar la propiedad ' + error, 'error');
                this.dialogRef.close(false);
            }
        });

        }else{
            this.flexService.addProperty(this.propiedad).subscribe({
            next: (result: ApiErrorResponse) => {
                if (result?.message) {
                    Swal.fire('Error', 'No se pudo crear la propiedad ' + result.message, 'error');
                    return;
                }
                this.cargando = false;
                this.dialogRef.close(true);
            },
            error: error => {
                Swal.fire('Error', 'No se pudo crear la propiedad ' + error, 'error');
                this.dialogRef.close(false);
            }
        });
        }
    }
    filtrarUsuarios(pFiltro) {
        this.flexService.listarRolUsuario(pFiltro).subscribe({ next: p => {
            this.usuarios = p;
        }, error: () => {} })
    }

    seleccionarUsuario(pUser: UsuarioDTO) {
        this.propiedad.usuario = pUser.llaveTabla;
        this.filtroUsuario = pUser.nombre;
        this.usuarios = [];
        this.buscandoUsuario = false;
    }
    seleccionarUsuarioExcluyente(pUser: UsuarioDTO) {
        this.propiedad.usuarioExcluyente = pUser.llaveTabla;
        this.filtroUsuarioExcluyente = pUser.nombre;
        this.usuarios = [];
        this.buscandoUsuarioExcluyente = false;
    }



    editarRelacion(prop: RelacionInternaDTO): void {}

    eliminarRelacion(prop: RelacionInternaDTO): void {}

    listarRelacionesPropiedad(): void {
        if (!this.propiedad.key) return;
        const prop = this.propiedad;
        const filtro = new RelacionInternaFilterDTO();
        filtro.propiedad = prop.llaveTabla;
        filtro.estado = prop.estado;

        this.flexService.relacionesPropiedad(filtro, null!).subscribe({
            next: (rels) => {
                this.propiedadesRelacion = rels;
            },
            error: () => {
                this.propiedadesRelacion = [];
                Swal.fire('Error', 'No se pudieron cargar las relaciones de la propiedad.', 'error');
            }
        });
    }
}
