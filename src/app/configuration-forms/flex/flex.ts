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
import { DocumentoPlantillaCaracteristicaEnum } from 'app/modules/full/neuron/model/sw42.enum';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';


export enum FormatoCampoSimboloEnum {
  T = '📝',
  F = '📅',
  Z = '🔄',
  N = '🔢',
  I = '⚙️',
  J = '📦',
  A = '📁',
  B = '🧩',
  G = '🛠️',
  U = '🟢',
  Q = '🧾',
  S = '📚',
  P = '📍',
  M = '🗾',
  V = '💡',
  C = '🔗'
}



@Component({
    selector: 'FlexComponent',
    standalone: true,
    templateUrl: 'flex.html',
    imports: [CommonModule,
            MatIconModule,]
})
export class FlexComponent implements OnInit {

    plantilla: DocumentoPlantillaDTO;
    fields: DocumentoPlantillaCaracteristicaDTO[];
    isLoading: boolean = false;

    campos: DocumentoPlantillaCaracteristicaDTO[] = [];

    draggedIndex: number | null = null;
    isDragging: boolean = false;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private flexService: FlexService,
        private utilsService: UtilsService
    ) { }

    ngOnInit(): void {
        this.isLoading = true;
        this.flexService.getTemplate(this.data.template, null).subscribe((_returnedTemplate) => {
            this.plantilla = _returnedTemplate;
            this.isLoading = false;
            this.getFields();
        });
    }

    getFields() {
        this.isLoading = true;
        this.flexService.getFields(this.plantilla.llaveTabla).subscribe((_returnedFields) => {
            this.fields = _returnedFields;
            this.campos = [...this.fields]; // copia para manipular orden
            this.isLoading = false;
        });
    }

    onClickCampo(campoId: string) {
        this.utilsService.fieldModalFlex(campoId);
    }

    propiedadesPlantilla() {
        this.utilsService.fieldModalFlex(this.data.template,'plantilla');
    }

    editarCampo(campoId: string): void {
        this.utilsService.fieldEditModalFlex(campoId);
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
        // Necesario para que el "drop" dispare
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

        this.onDragEnd();

        // Si quieres guardar el nuevo orden:
        // this.flexService.saveOrder(this.campos).subscribe();
    }

    // === Caneca de basura ===

    onTrashDragOver(event: DragEvent) {
        event.preventDefault();
    }


    getFormatoLabel(codigo: string): string {
        const entry = Object.entries(FormatoCampoSimboloEnum).find(([key, value]) => value === codigo);

        return entry ? entry[0] : codigo;
    }

    getFormatoLabelImage(codigo: string): string {
        return FormatoCampoSimboloEnum[codigo] ?? codigo;
    }

    onTrashDrop(event: DragEvent) {
        event.preventDefault();

        if (this.draggedIndex !== null) {
            const eliminado = this.campos.splice(this.draggedIndex, 1)[0];

            // Si quieres eliminar también en backend:
            // this.flexService.deleteField(eliminado.llaveTabla).subscribe();
        }

        this.onDragEnd();
    }
}
