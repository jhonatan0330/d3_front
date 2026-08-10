import { Component, ChangeDetectionStrategy, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { FlexService } from '../flex.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DocumentoPlantillaCaracteristicaDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { DocumentoPlantillaCaracteristicaEnum } from 'app/modules/full/neuron/model/sw42.enum';

@Component({
    selector: 'app-campo-form',
    imports: [FormsModule],
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './addField.html'
})
export class AddFieldComponent {
    private flexService = inject(FlexService);
    data = inject(MAT_DIALOG_DATA);
    private dialogRef = inject<MatDialogRef<AddFieldComponent>>(MatDialogRef);

    campo: DocumentoPlantillaCaracteristicaDTO;

    imagenPreview: string | null = null;
    cargando = false;

    opciones = Object.entries(DocumentoPlantillaCaracteristicaEnum).map(([nombre, valor]) => ({
        nombre,
        valor
    }));

    ngOnInit(): void {
        if (this.data.campo) {
            this.campo = this.data.campo;
        } else {
            this.flexService.getField(this.data.template, null!) //datos del campo antiguo
                .subscribe(p => {
                    this.campo = p;
                });
        }
    }



    actualizarCampo(): void {

        if (this.campo.llaveTabla) {
            this.flexService.actualizarDocumentoPlantillaCaracteristica(this.campo).subscribe(p => {
                this.campo = p;
                this.dialogRef.close(p);
            });
        } else {
            this.flexService.guardarDocumentoPlantillaCaracteristica(this.campo).subscribe(p => {
                this.campo = p;
                this.dialogRef.close(p);
            });
        }

    }

    limpiarFormulario(): void { }
}
