import { Component, Inject } from '@angular/core';
import { PropiedadCampoDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { PropiedadValorDefinidoDTO } from 'app/shared/shared.domain';
import { FlexService } from '../flex.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RolAccesoFilterDTO, UsuarioDTO } from 'app/authentication/authentication.domain';


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

    filtroUsuario = '';
    filtroUsuarioExcluyente = '';
    buscandoUsuario = false;
    buscandoUsuarioExcluyente = false;

    private debounceTimer: any;

    constructor(
        private flexService: FlexService,
        @Inject(MAT_DIALOG_DATA) public data: any,

    ) { }


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

        if(this.data.propiedad){
            this.propiedad = this.data.propiedad;
        }else{
            this.propiedad = new PropiedadCampoDTO;
        }

        const _a = new PropiedadValorDefinidoDTO();
            _a.origenCategoria = 'C';
            _a.origen = 'C';
        this.flexService.listarPorOrigenPropiedadValorDefinido(_a, null)
            .subscribe(p => {
                this.propiedadValores = p;
            });
            this.flexService.listarConsultaRolAcceso().subscribe(p => {
            this.roles = p;
        })
        //this.flexService.listarRolUsuario(this.filtroUsuario).subscribe(p => { this.usuarios = p; })
    }

    guardarPropiedad() {
        this.cargando = true;
        this.flexService.addProperty(this.propiedad).subscribe({
            next: () => {
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
}
