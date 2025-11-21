import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
    DocumentoPlantillaCaracteristicaDTO,
    propiedadCampo,
    PropiedadCampoDTO,
} from 'app/modules/full/neuron/model/sw42.domain';
import Swal from 'sweetalert2';
import { FlexService } from '../flex.service';
import { UtilsService } from 'app/modules/full/neuron/service/utils.service';
import { PropiedadValorDefinidoDTO } from 'app/shared/shared.domain';

@Component({
    selector: 'FieldComponent',
    standalone: true,
    templateUrl: 'fieldComponent.html',
    imports: [CommonModule]
})
export class FieldComponent implements OnInit {


    field: DocumentoPlantillaCaracteristicaDTO;
    propiedadesCampo: propiedadCampo[] = [];

    isLoading = false;
    cargandoCampo = false;
    expandido = true;
    tipo = 'Campo';

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private flexService: FlexService,
        private utilsService: UtilsService
    ) { }

    ngOnInit(): void {
        if (!this.data?.template) {
            Swal.fire('Advertencia', 'No se recibió información .', 'warning');
            return;
        }

        if (this.data.tipo == 'plantilla') {
            this.tipo = 'Plantilla';
            this.field = new DocumentoPlantillaCaracteristicaDTO();
            this.field.llaveTabla = this.data.template;
            this.listarPropiedadesCampo();

        } else {
            this.cargarCampo();
        }

    }

    cargarCampo(): void {
        this.isLoading = true;

        this.flexService.getField(this.data.template, null).subscribe({
            next: (resp) => {
                this.field = resp;
                this.listarPropiedadesCampo();
                this.isLoading = false;

            },
            error: (err) => {
                console.error('Error al cargar campo:', err);
                this.isLoading = false;
                Swal.fire('Error', 'No se pudo cargar la información del campo.', 'error');
            }
        });
    }

    listarPropiedadesCampo(): void {
        if (!this.field?.llaveTabla) {
            return;
        }

        this.flexService.listarConsultaPropiedad(this.field.llaveTabla, null).subscribe({
            next: (props) => {
                this.propiedadesCampo = props;
            },
            error: () => {
                this.propiedadesCampo = [];
                Swal.fire('Error', 'No se pudieron cargar las propiedades del campo.', 'error');
            }
        });
    }

    editarCampo(): void {
        this.utilsService.fieldEditModalFlex(this.field.llaveTabla);
    }

    editarPropiedad(pPropiedad?: PropiedadCampoDTO): void {
        const _a = new PropiedadValorDefinidoDTO();
        if (this.tipo === 'Plantilla') {
            _a.origen = 'L';
            this.utilsService.propertyAddModalFlex(this.field.llaveTabla, _a, pPropiedad);
        } else {
            _a.origen = 'C';
            _a.origenCategoria = this.field.formato;
            this.utilsService.propertyAddModalFlex(this.field.llaveTabla, _a, pPropiedad);
        }
    }

    agregarPropiedadCampo() {
        const _a = new PropiedadValorDefinidoDTO();
        if (this.tipo === 'Plantilla') {
            _a.origen = 'L';
            this.utilsService.propertyAddModalFlex(this.field.llaveTabla, _a).subscribe(response => {
                if (response) this.listarPropiedadesCampo();
            });
        } else {
            _a.origen = 'C';
            _a.origenCategoria = this.field.formato;
            this.utilsService.propertyAddModalFlex(this.field.llaveTabla, _a).subscribe(response => {
                if (response) this.listarPropiedadesCampo();
            });
        }
    }

    toggleExpandido(): void {
        this.expandido = !this.expandido;
    }

    eliminarPropiedad(pPropiedad: any): void {
        Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción eliminará la propiedad seleccionada.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33'
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Eliminando...',
                    text: 'Por favor espera',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                this.flexService.inactivarPropiedad(pPropiedad).subscribe({
                    next: () => {
                        Swal.fire('Eliminado', 'La propiedad fue eliminada correctamente.', 'success');
                        this.cargarCampo();
                    },
                    error: (err) => {
                        console.error('Error al eliminar la propiedad de campo:', err);
                        Swal.fire('Error', 'No se pudo eliminar la propiedad.', 'error');
                    }
                });
            }
        });
    }

}
