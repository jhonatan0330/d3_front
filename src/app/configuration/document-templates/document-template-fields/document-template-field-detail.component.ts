import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import {
    DocumentoPlantillaCaracteristicaDTO,
    PropiedadCampoDTO,
    RelacionInternaDTO,
    propiedadCampo
} from 'app/document/model/sw42.domain';
import { PropiedadDTO } from 'app/shared/shared.domain';
import Swal from 'sweetalert2';
import { DocumentTemplateService } from '../../configuracion.api';
import { UtilsService } from 'app/document/service/utils.service';
import { PropiedadValorDefinidoDTO } from 'app/shared/shared.domain';

@Component({
    selector: 'DocumentTemplateFieldDetailComponent',
    templateUrl: './document-template-field-detail.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [CommonModule, MatIconModule]
})
export class DocumentTemplateFieldDetailComponent implements OnInit {
    data = inject(MAT_DIALOG_DATA);
    private documentTemplateService = inject(DocumentTemplateService);
    private utilsService = inject(UtilsService);
    private dialogRef = inject<MatDialogRef<DocumentTemplateFieldDetailComponent>>(MatDialogRef);


    field: DocumentoPlantillaCaracteristicaDTO;
    propiedadesCampo: PropiedadDTO[] = [];

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

        this.documentTemplateService.getField(this.data.template).subscribe({
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

        this.documentTemplateService.getTemplateProperties(this.field.llaveTabla).subscribe({
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

    editarPropiedad(pPropiedad?: PropiedadDTO): void {
        if (!pPropiedad) return;
        const _a = new PropiedadValorDefinidoDTO();
        const pdto = this.toPropiedadCampo(pPropiedad);
        if (this.tipo === 'Plantilla') {
            _a.origen = 'L';
            this.utilsService.propertyAddModalFlex(this.field.llaveTabla, _a, pdto);
        } else {
            _a.origen = 'C';
            _a.origenCategoria = this.field.formato;
            this.utilsService.propertyAddModalFlex(this.field.llaveTabla, _a, pdto);
        }
    }

    private toPropiedadCampo(prop: PropiedadDTO): PropiedadCampoDTO {
        const pc = new PropiedadCampoDTO();
        pc.llaveTabla = prop.llaveTabla;
        pc.propiedadValor = prop.propiedadValor;
        pc.tipo = prop.tipo;
        pc.nombre = prop.nombre;
        pc.key = prop.key;
        pc.campo = prop.campo;
        pc.valor = Number(prop.valor) || 0;
        pc.texto = prop.texto || '';
        pc.motivo = prop.motivo || '';
        pc.estado = prop.estado || 'A';
        pc.cambioCreacion = '';
        pc.campo = prop.campo || '';
        pc.fechaDefinicion = new Date();
        pc.fechaImplementacion = new Date();
        pc.key = prop.key || '';
        pc.motivo = prop.motivo || '';
        pc.nombre = prop.nombre || '';
        pc.propiedadValor = prop.propiedadValor || '';
        pc.tipo = prop.tipo || '';
        pc.valor = 0;
        pc.texto = prop.texto || '';
        return pc;
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

                this.documentTemplateService.inactivateProperty(pPropiedad).subscribe({
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