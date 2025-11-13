import { Component, Inject } from '@angular/core';
import { propiedadCampo, PropiedadCampoDTO, RelacionInternaDTO, RelacionInternaFilterDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { PropiedadValorDefinidoDTO } from 'app/shared/shared.domain';
import { FlexService } from '../flex.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { RolAccesoFilterDTO, UsuarioDTO } from 'app/authentication/authentication.domain';
import { ApiErrorResponse } from 'app/modules/full/neuron/model/sw42.utils';


@Component({
    standalone: true,
    selector: 'app-property-form',
    templateUrl: './addProperty.html',
    imports: [CommonModule, FormsModule],
})
export class AddPropertyComponent {
    cargando = false;

    //propiedad : PropiedadValorDefinidoDTO; PropiedadCampoDTO
    propiedad: PropiedadCampoDTO;

    propiedadValores: PropiedadValorDefinidoDTO[];
    roles: RolAccesoFilterDTO[];
    usuarios: UsuarioDTO[];

    propiedadesRelacion: RelacionInternaDTO[] = [];
    def: PropiedadValorDefinidoDTO = null;

    filtroUsuario = '';
    filtroUsuarioExcluyente = '';
    buscandoUsuario = false;
    buscandoUsuarioExcluyente = false;

    private debounceTimer: any;

    constructor(
        private flexService: FlexService,
        @Inject(MAT_DIALOG_DATA) public data: any,

    ) { }

    onPropiedadValorChange(llaveSeleccionada: string): void {
        this.def = this.propiedadValores.find(p => p.llaveTabla === llaveSeleccionada);
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
        } else {
            this.propiedad = new PropiedadCampoDTO;
        }

        
        this.propiedad.campo = this.data.template;
        this.propiedad.tipo = "C";
        this.propiedad.valor = 1;


        this.buscarRoles();
        this.buscarPropiedades();
        this.listarRelacionesPropiedad();
    }

    buscarPropiedades(){
        const _a = new PropiedadValorDefinidoDTO();
        _a.origenCategoria = 'C';
        _a.origen = 'C';
        this.flexService.listarPorOrigenPropiedadValorDefinido(_a, null)
            .subscribe(p => {
                this.propiedadValores = p;
            });
    }
    buscarRoles(){
        this.flexService.listarConsultaRolAcceso().subscribe(p => {
            this.roles = p;
        })
    }

    guardarPropiedad() {
        this.cargando = true;
        this.flexService.addProperty(this.propiedad).subscribe({
            next: (result: ApiErrorResponse) => {
                if (result?.message) {
                    Swal.fire('Error', 'No se pudo crear la propiedad ' + result.message, 'error');
                    return;
                }
                this.cargando = false;
                Swal.fire('Exito', 'Propiedad cargada con exito');
            },
            error: error => {
                Swal.fire('Error', 'No se pudo crear la propiedad ' + error, 'error');
            }
        });
    }
    filtrarUsuarios(pFiltro) {
        this.flexService.listarRolUsuario(pFiltro).subscribe(p => {
            this.usuarios = p;
        })
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

    

    listarRelacionesPropiedad(): void {
        if (!this.propiedad.propiedadValor) return;
        const prop = this.propiedad;
        const filtro = new RelacionInternaFilterDTO();
        filtro.propiedad = prop.llaveTabla;
        filtro.estado = prop.estado;

        this.flexService.relacionesPropiedad(filtro, null).subscribe({
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
