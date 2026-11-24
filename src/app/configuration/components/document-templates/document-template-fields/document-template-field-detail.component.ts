import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import {
    DocumentoPlantillaCaracteristicaDTO,
    PropiedadCampoDTO,
    propiedadCampo
} from 'app/document/document.types';
import { PropiedadDTO } from 'app/shared/shared.domain';
import { DocumentTemplateService } from '../../../configuracion.api';
import { DocumentTemplateFieldFormComponent } from 'app/configuration/components/document-templates/document-template-fields/document-template-field-form/document-template-field-form.component';
import { PropertyModalComponent } from 'app/configuration/components/shared/property-modal/property-modal.component';
import { PropiedadValorDefinidoDTO } from 'app/shared/shared.domain';

@Component({
    selector: 'DocumentTemplateFieldDetailComponent',
    templateUrl: './document-template-field-detail.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [CommonModule, MatIconModule]
})
export class DocumentTemplateFieldDetailComponent implements OnInit {
    private notificationCenter = inject(NotificationCenterService);
    data = inject(MAT_DIALOG_DATA);
    private documentTemplateService = inject(DocumentTemplateService);
    private dialog = inject(MatDialog);
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
        }catch(e){  }
    }

    ngOnInit(): void {
        if (!this.data?.template) {
            this.notificationCenter.fire('Advertencia', 'No se recibió información .', 'warning');
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
            error: () => {
                this.isLoading = false;
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
            }
        });
    }

    editarCampo(): void {
        this.dialog.open(DocumentTemplateFieldFormComponent, {
            maxHeight: '90vh',
            data: { id: this.field?.llaveTabla, templateId: this.field?.nodoSuperior ?? '' },
        });
    }

    private abrirModalPropiedad(pCampo: string, ptipo: PropiedadValorDefinidoDTO, pPropiedad?: PropiedadCampoDTO) {
        return this.dialog.open(PropertyModalComponent, {
            maxHeight: '90vh',
            data: {
                propiedad: null,
                propiedadId: pPropiedad?.llaveTabla,
                tipoOrigen: ptipo?.origen,
                origenCategoria: ptipo?.origenCategoria ?? '',
                campoKey: pCampo,
            },
        }).afterClosed();
    }

    editarPropiedad(pPropiedad?: PropiedadDTO): void {
        if (!pPropiedad) return;
        const _a = new PropiedadValorDefinidoDTO();
        const pdto = this.toPropiedadCampo(pPropiedad);
        if (this.tipo === 'Plantilla') {
            _a.origen = 'L';
            this.abrirModalPropiedad(this.field.llaveTabla, _a, pdto);
        } else {
            _a.origen = 'C';
            _a.origenCategoria = this.field.tipo;
            this.abrirModalPropiedad(this.field.llaveTabla, _a, pdto);
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
        pc.valor = prop.valor || '';
        pc.texto = prop.texto || '';
        pc.motivo = prop.motivo || '';
        pc.imagen = prop.imagen || '';
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
        pc.valor = '';
        pc.texto = prop.texto || '';
        return pc;
    }

    agregarPropiedadCampo() {
        const _a = new PropiedadValorDefinidoDTO();
        if (this.tipo === 'Plantilla') {
            _a.origen = 'L';
            this.abrirModalPropiedad(this.field.llaveTabla, _a).subscribe({ next: response => {
                if (response) this.listarPropiedadesCampo();
            }, error: () => {} });
        } else {
            _a.origen = 'C';
            _a.origenCategoria = this.field.tipo;
            this.abrirModalPropiedad(this.field.llaveTabla, _a).subscribe({ next: response => {
                if (response) this.listarPropiedadesCampo();
            }, error: () => {} });
        }
    }

    toggleExpandido(): void {
        this.expandido = !this.expandido;
    }

    listarRelacionesPropiedad(prop: propiedadCampo): void {}

    eliminarPropiedad(pPropiedad: any): void {
        this.notificationCenter.fire({
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
                this.notificationCenter.fire({
                    title: 'Eliminando...',
                    text: 'Por favor espera',
                    allowOutsideClick: false,
                    didOpen: () => {
                        this.notificationCenter.showLoading();
                    }
                });

                this.documentTemplateService.inactivateProperty(pPropiedad).subscribe({
                    next: () => {
                        this.notificationCenter.fire('Eliminado', 'La propiedad fue eliminada correctamente.', 'success');
                        this.cargarCampo();
                    }
                });
            }
        });
    }

}