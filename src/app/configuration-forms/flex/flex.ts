import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
    DocumentoPlantillaCaracteristicaDTO,
    DocumentoPlantillaDTO
} from 'app/modules/full/neuron/model/sw42.domain';
import Swal from 'sweetalert2';
import { FlexService } from '../flex.service';
import { UtilsService } from 'app/modules/full/neuron/service/utils.service';
import { DocumentoPlantillaCaracteristicaEnum, FormatoCampoSimboloEnum } from 'app/modules/full/neuron/model/sw42.enum';
import { MatIconModule } from '@angular/material/icon';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';


@Component({
    selector: 'FlexComponent',
    templateUrl: 'flex.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [CommonModule, FormsModule,
        MatIconModule, DragDropModule]
})
export class FlexComponent implements OnInit {
    data = inject(MAT_DIALOG_DATA);
    dialogRef = inject<MatDialogRef<FlexComponent>>(MatDialogRef);
    private flexService = inject(FlexService);
    private utilsService = inject(UtilsService);


    plantilla: DocumentoPlantillaDTO;
    isLoading: boolean = false;
    mostrarSelectorFormato: boolean = false;
    // Si true mostramos y editamos el campo 'codigo', si false usamos 'nombre'
    mostrarCodigo: boolean = true;

    campos: DocumentoPlantillaCaracteristicaDTO[] = [];
    nuevoCampo: DocumentoPlantillaCaracteristicaDTO;
    campoActual: DocumentoPlantillaCaracteristicaDTO;

    draggedIndex: number | null = null;
    isDragging: boolean = false;

    formatos = Object.keys(FormatoCampoSimboloEnum) as (keyof typeof FormatoCampoSimboloEnum)[];

    close(): void {
        if (this.dialogRef) {
            this.dialogRef.close();
        }
    }

    ngOnInit(): void {
        this.isLoading = true;
        this.nuevoCampo = new DocumentoPlantillaCaracteristicaDTO();
        this.nuevoCampo.formato = 'T';
        this.nuevoCampo.plantilla = this.data.template;
        this.flexService.getTemplate(this.data.template, null!).subscribe((_returnedTemplate) => {
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
       /* this.utilsService.fieldEditModalFlex(campoId).subscribe(result => {
            if (result) {
                this.getFields();
            }
        });*/
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

    // Inicia la edición del código de un campo (muestra el input con el valor codigo)
    startEditingCodigo(item: DocumentoPlantillaCaracteristicaDTO) {
        // marcar como en modo edición y preparar valor temporal
        (item as any).editandoCodigo = true;
        (item as any).editando = true;
        // si mostrarCodigo está activo, inicializar con codigo, si no con nombre
        (item as any)._editValue = this.mostrarCodigo ? (item.codigo ?? '') : (item.nombre ?? '');
        this.campoActual = item;
    }

    // Actualiza el valor temporal en la edición
    onItemValueChange(item: DocumentoPlantillaCaracteristicaDTO, value: string) {
        (item as any)._editValue = value;
    }

    // Al presionar Enter guardamos y salimos del modo edición
    onEnterItem(item: DocumentoPlantillaCaracteristicaDTO) {
        (item as any).editando = false;
        (item as any).editandoCodigo = false;
        // asigna el código guardado y lo persiste
        if ((item as any)._editValue !== undefined) {
            if (this.mostrarCodigo) {
                item.codigo = (item as any)._editValue;
            } else {
                item.nombre = (item as any)._editValue;
            }
            this.campoActual = item;
            this.actualizarCampo();
        }
    }

    // Al perder el foco salimos del modo edición sin guardar automáticamente
    onBlurItem(item: DocumentoPlantillaCaracteristicaDTO) {
        // cerrar modo edición (no guarda automáticamente)
        (item as any).editandoCodigo = false;
        (item as any).editando = false;
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

    // Cierra todos los selectores de formato (nuevo y por-item)
    closeAllFormatSelectors(): void {
        this.mostrarSelectorFormato = false;
        if (this.campos && this.campos.length) {
            for (const c of this.campos) {
                // añadimos la propiedad dinámicamente en la plantilla
                (c as any).mostrarSelectorFormato = false;
            }
        }
    }

    private async deleteField(){
        const eliminado = this.campos.splice(this.draggedIndex!, 1)[0];
            // eliminar en backend:
        const ok = await this.confirmar();
        if (!ok) {
            return; // se canceló
        }
        this.flexService.inactivarDocumentoPlantillaCaracteristica(eliminado).subscribe({ error: () => {} });
    }

    async actualizarCampo() {
        const ok = await this.confirmar();
        if (!ok) {
            return; // se canceló
        }
        this.flexService.actualizarDocumentoPlantillaCaracteristica(this.campoActual).subscribe({ error: () => {} });
    }
}
