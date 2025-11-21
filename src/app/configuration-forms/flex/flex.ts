import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
    DocumentoPlantillaCaracteristicaDTO,
    DocumentoPlantillaDTO
} from 'app/modules/full/neuron/model/sw42.domain';
import Swal from 'sweetalert2';
import { FlexService } from '../flex.service';
import { UtilsService } from 'app/modules/full/neuron/service/utils.service';
import { DocumentoPlantillaCaracteristicaEnum, FormatoCampoSimboloEnum } from 'app/modules/full/neuron/model/sw42.enum';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';


@Component({
    selector: 'FlexComponent',
    standalone: true,
    templateUrl: 'flex.html',
    imports: [CommonModule, FormsModule,
        MatIconModule,]
})
export class FlexComponent implements OnInit {

    plantilla: DocumentoPlantillaDTO;
    isLoading: boolean = false;
    mostrarSelectorFormato: boolean = false;

    campos: DocumentoPlantillaCaracteristicaDTO[] = [];
    nuevoCampo: DocumentoPlantillaCaracteristicaDTO;
    campoActual: DocumentoPlantillaCaracteristicaDTO;

    draggedIndex: number | null = null;
    isDragging: boolean = false;

    formatos = Object.keys(FormatoCampoSimboloEnum) as (keyof typeof FormatoCampoSimboloEnum)[];


    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private flexService: FlexService,
        private utilsService: UtilsService
    ) { }

    ngOnInit(): void {
        this.isLoading = true;
        this.nuevoCampo = new DocumentoPlantillaCaracteristicaDTO();
        this.nuevoCampo.formato = 'T';
        this.nuevoCampo.plantilla = this.data.template;
        this.flexService.getTemplate(this.data.template, null).subscribe((_returnedTemplate) => {
            this.plantilla = _returnedTemplate;
            this.isLoading = false;
            this.getFields();
        });
    }

    getFields() {
        this.isLoading = true;
        this.flexService.getFields(this.plantilla.llaveTabla).subscribe((_returnedFields) => {
            this.campos = _returnedFields;
            this.isLoading = false;
        });
    }

    onClickCampo(campoId: string) {
        this.utilsService.fieldModalFlex(campoId);
    }

    propiedadesPlantilla() {
        this.utilsService.fieldModalFlex(this.data.template, 'plantilla');
    }

    editarCampo(campoId: string): void {
        this.utilsService.fieldEditModalFlex(campoId).subscribe(result => {
            if (result) {
                this.getFields();
            }
        });
    }

    agregarCampo(): void {
        //this.utilsService.fieldAddModalFlex(this.data.template, this.nuevoCampo);
        this.flexService.guardarDocumentoPlantillaCaracteristica(this.nuevoCampo).subscribe(p => {
                //this.nuevoCampo = p;
                this.nuevoCampo.nombre = '';
                this.getFields();
            });
    }

    onNuevoNombreChange(valor: string) {
        //algo
    }


    async confirmar(): Promise<boolean> {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción es irreversible.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33'
        });

        return result.isConfirmed;
    }


    onDragStart(index: number) {
        this.draggedIndex = index;
        this.isDragging = true;
    }

    onDragEnd() {
        this.draggedIndex = null;
        this.isDragging = false;
    }

    onDragOver(index: number, event: DragEvent) {
        event.preventDefault();
    }

    onDrop(index: number, event: DragEvent) {
        event.preventDefault();

        if (this.draggedIndex === null) {
            this.onDragEnd();
            return;
        }

        const from = this.draggedIndex;
        const to = index;

        if (from === to) {
            this.onDragEnd();
            return;
        }

        const item = this.campos[from];
        this.campos.splice(from, 1);
        this.campos.splice(to, 0, item);
        item.orden = to + 1;

        this.onDragEnd();
        this.flexService.actualizarDocumentoPlantillaCaracteristica(item).subscribe(p => {
            //this.campo = p;
        });
    }

    // === Caneca de basura ===

    onTrashDragOver(event: DragEvent) {
        event.preventDefault();
    }


    getFormatoLabel(codigo: string): string {
        const entry = Object.entries(DocumentoPlantillaCaracteristicaEnum).find(([key, value]) => value === codigo);

        return entry ? entry[0] : codigo;
    }

    getFormatoLabelImage(codigo: string): string {
        return FormatoCampoSimboloEnum[codigo] ?? codigo;
    }

    onTrashDrop(event: DragEvent) {
        event.preventDefault();

        if (this.draggedIndex !== null) {
            this.deleteField();
        }

        this.onDragEnd();
    }

    private async deleteField(){
        const eliminado = this.campos.splice(this.draggedIndex, 1)[0];
            // eliminar en backend:

        const ok = await this.confirmar();

        if (!ok) {
            return; // se canceló
        }

        this.flexService.inactivarDocumentoPlantillaCaracteristica(eliminado).subscribe();
    }

    async actualizarCampo() {
        const ok = await this.confirmar();

        if (!ok) {
            return; // se canceló
        }

        this.flexService.actualizarDocumentoPlantillaCaracteristica(this.campoActual).subscribe();
    }
}
