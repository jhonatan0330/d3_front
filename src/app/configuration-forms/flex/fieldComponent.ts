import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import {
    DocumentoPlantillaCaracteristicaDTO,
    propiedadCampo,
    PropiedadCampoDTO,
    RelacionInternaDTO,
} from 'app/modules/full/neuron/model/sw42.domain';
import Swal from 'sweetalert2';
import { FlexService } from '../flex.service';
import { UtilsService } from 'app/modules/full/neuron/service/utils.service';
import { PropiedadValorDefinidoDTO } from 'app/shared/shared.domain';

@Component({
    selector: 'FieldComponent',
    templateUrl: 'fieldComponent.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [CommonModule, MatIconModule]
})
export class FieldComponent implements OnInit {
    data = inject(MAT_DIALOG_DATA);
    private flexService = inject(FlexService);
    private utilsService = inject(UtilsService);
    private dialogRef = inject<MatDialogRef<FieldComponent>>(MatDialogRef);



    field: DocumentoPlantillaCaracteristicaDTO;
    propiedadesCampo: propiedadCampo[] = [];

    isLoading = false;
    cargandoCampo = false;
    expandido = true;
    tipo = 'Campo';

    editarDisabled = true;

    close(): void {
        try{
            this.dialogRef.close();
        }catch(e){ console.warn('Error closing dialog', e); }
    }

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

        this.flexService.getField(this.data.template, null!).subscribe({
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

        this.flexService.listarConsultaPropiedad(this.field.llaveTabla, null!).subscribe({
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

    editarPropiedad(pPropiedad?: propiedadCampo): void {
        const _a = new PropiedadValorDefinidoDTO();
        const pdto = pPropiedad as PropiedadCampoDTO;
        if (this.tipo === 'Plantilla') {
            _a.origen = 'L';
            this.utilsService.propertyAddModalFlex(this.field.llaveTabla, _a, pdto);
        } else {
            _a.origen = 'C';
            _a.origenCategoria = this.field.formato;
            this.utilsService.propertyAddModalFlex(this.field.llaveTabla, _a, pdto);
        }
    }

    agregarPropiedadCampo() {
        const _a = new PropiedadValorDefinidoDTO();
        if (this.tipo === 'Plantilla') {
            _a.origen = 'L';
            this.utilsService.propertyAddModalFlex(this.field.llaveTabla, _a).subscribe({ next: response => {
                if (response) this.listarPropiedadesCampo();
            }, error: () => {} });
        } else {
            _a.origen = 'C';
            _a.origenCategoria = this.field.formato;
            this.utilsService.propertyAddModalFlex(this.field.llaveTabla, _a).subscribe({ next: response => {
                if (response) this.listarPropiedadesCampo();
            }, error: () => {} });
        }
    }

    toggleExpandido(): void {
        this.expandido = !this.expandido;
    }

    listarRelacionesPropiedad(prop: propiedadCampo): void {}

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
