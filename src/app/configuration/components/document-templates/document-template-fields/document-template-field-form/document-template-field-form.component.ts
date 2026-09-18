import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { DocumentoPlantillaCaracteristicaDTO, DocumentoPlantillaDTO } from 'app/document/document.types';
import { FormatoCampoSimboloEnum, DocumentoPlantillaCaracteristicaEnum } from 'app/document/form/form.enum';
import { DocumentTemplateService } from 'app/configuration/configuracion.api';
import { ImageUploaderComponent } from 'app/upload/components/image-uploader/image-uploader.component';
import { PropertyPanelComponent } from '../../../shared/property-panel/property-panel.component';
import Swal from 'sweetalert2';

interface FieldFormData {
    field?: DocumentoPlantillaCaracteristicaDTO;
    template: DocumentoPlantillaDTO;
}

@Component({
    selector: 'app-document-template-field-form',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule, ImageUploaderComponent],
    templateUrl: './document-template-field-form.component.html',
})
export class DocumentTemplateFieldFormComponent implements OnInit {
    public dialogRef = inject<MatDialogRef<DocumentTemplateFieldFormComponent>>(MatDialogRef);
    public data = inject<FieldFormData>(MAT_DIALOG_DATA);

    private dialog = inject(MatDialog);
    private service = inject(DocumentTemplateService);

    field: DocumentoPlantillaCaracteristicaDTO = new DocumentoPlantillaCaracteristicaDTO();
    cargando = false;
    formatos = Object.keys(FormatoCampoSimboloEnum) as (keyof typeof FormatoCampoSimboloEnum)[];

    ngOnInit(): void {
        if (this.data.field) {
            this.field = { ...this.data.field };
            this.field.propiedades = this.field.propiedades || [];
        } else {
            this.field = new DocumentoPlantillaCaracteristicaDTO();
            this.field.estado = 'A';
            this.field.formato = 'T';
            this.field.plantilla = this.data.template.llaveTabla;
            this.field.orden = (this.data.template.caracteristicas?.length || 0) + 1;
        }
    }

    openPropiedades(): void {
      if (!this.field.llaveTabla) return;
      this.dialog.open(PropertyPanelComponent, {
        width: '800px',
        maxWidth: '95vw',
        maxHeight: '90vh',
        disableClose: true,
        data: {
          campoKey: this.field.llaveTabla,
          tipoOrigen: 'C',
          origenCategoria: this.field.formato,
          titulo: this.field.nombre
        }
      });
    }

    getFormatoIcon(formato: string): string {
        return FormatoCampoSimboloEnum[formato as keyof typeof FormatoCampoSimboloEnum] ?? '?';
    }

    getFormatoLabel(formato: string): string {
        const entry = Object.entries(DocumentoPlantillaCaracteristicaEnum).find(([key, value]) => value === formato);
        return entry ? entry[0] : formato;
    }

    onSubmit(): void {
        this.cargando = true;

        const request$ = this.field.llaveTabla
            ? this.service.updateField(this.field)
            : this.service.createField(this.field);

        request$.subscribe({
            next: (result) => {
                this.cargando = false;
                Swal.fire('Éxito', 'Campo guardado correctamente', 'success');
                this.dialogRef.close(result);
            },
            error: (err) => {
                this.cargando = false;
                Swal.fire('Error', 'No se pudo guardar el campo', 'error');
            }
        });
    }
}