import { Component, Inject } from '@angular/core';
import { PropiedadCampoDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { PropiedadValorDefinidoDTO } from 'app/shared/shared.domain';
import { FlexService } from '../flex.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { NgModule } from '@angular/core';

@Component({
    selector: 'app-property-form',
    templateUrl: './addProperty.html',
})
export class addPropertyComponent {
    cargando = false;

    //propiedad : PropiedadValorDefinidoDTO; PropiedadCampoDTO
    propiedad: PropiedadCampoDTO;

    propiedadValores: PropiedadValorDefinidoDTO[];

    constructor(
        private flexService: FlexService,
        @Inject(MAT_DIALOG_DATA) public data: any,

    ) { }

    ngOnInit(): void {

        const _a = new PropiedadValorDefinidoDTO();
        _a.origenCategoria = 'C';
        _a.origen='C';
        this.flexService.listarPorOrigenPropiedadValorDefinido(_a, null)
            .subscribe(p => {
                this.propiedadValores = p;
            });
    }

    guardarPropiedad() {
        this.cargando = true;
        this.flexService.addProperty(this.propiedad).subscribe({
                next: () => {
                    this.cargando = false;
                },
                error: error => {
                    Swal.fire('Error', 'No se pudo crear la propiedad '+error, 'error');
                }
            });
    }
}
