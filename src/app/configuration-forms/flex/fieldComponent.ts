import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
    DocumentoPlantillaCaracteristicaDTO,
    propiedadCampo,
    PropiedadCampoDTO,
    RelacionInternaDTO,
    RelacionInternaFilterDTO
} from 'app/modules/full/neuron/model/sw42.domain';
import Swal from 'sweetalert2';
import { FlexService } from '../flex.service';
import { UtilsService } from 'app/modules/full/neuron/service/utils.service';

@Component({
    selector: 'FieldComponent',
    standalone: true,
    templateUrl: 'fieldComponent.html',
    imports: [CommonModule]
})
export class FieldComponent implements OnInit {


    campo: DocumentoPlantillaCaracteristicaDTO;
    propiedadesCampo: propiedadCampo[] = [];
    propiedadesRelacion: RelacionInternaDTO[] = [];

    isLoading = false;
    cargandoCampo = false;
    expandido = true;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private flexService: FlexService,
        private utilsService: UtilsService
    ) { }

    ngOnInit(): void {
        if (!this.data?.template) {
            Swal.fire('Advertencia', 'No se recibió información del campo.', 'warning');
            return;
        }

        this.cargarCampo();
    }

    cargarCampo(): void {
        this.isLoading = true;

        this.flexService.getField(this.data.template, null).subscribe({
            next: (resp) => {
                this.campo = resp;
                this.isLoading = false;
                this.listarPropiedadesCampo();
            },
            error: (err) => {
                console.error('Error al cargar campo:', err);
                this.isLoading = false;
                Swal.fire('Error', 'No se pudo cargar la información del campo.', 'error');
            }
        });
    }

    listarPropiedadesCampo(): void {
        if (!this.campo?.llaveTabla) return;

        this.flexService.listarConsultaPropiedad(this.campo.llaveTabla, null).subscribe({
            next: (props) => {
                this.propiedadesCampo = props;
            },
            error: () => {
                this.propiedadesCampo = [];
                Swal.fire('Error', 'No se pudieron cargar las propiedades del campo.', 'error');
            }
        });
    }

    listarRelacionesPropiedad(prop: propiedadCampo): void {
        if (!this.campo) return;

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

    editarCampo(): void {
        this.utilsService.fieldEditModalFlex(this.campo.llaveTabla);
    }

    editarPropiedad(pPropiedad?:PropiedadCampoDTO): void {
        this.utilsService.fieldAddModalFlex(null,pPropiedad);
    }

    agregarPropiedadCampo() {
        this.utilsService.fieldAddModalFlex(this.campo.llaveTabla);
    }

    toggleExpandido(): void {
        this.expandido = !this.expandido;
    }
}
