import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { DocumentoPlantillaCaracteristicaDTO } from 'app/document/document.types';
import { FormatoCampoSimboloEnum, DocumentoPlantillaCaracteristicaEnum } from 'app/document/form/form.enum';
import { DocumentTemplateService } from 'app/configuration/configuracion.api';
import { PropertyPanelComponent } from '../../../shared/property-panel/property-panel.component';
import { TemplateChildDialogData } from '../../../shared/dialog-data';

@Component({
    selector: 'app-document-template-field-form',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule],
    templateUrl: './document-template-field-form.component.html',
})
export class DocumentTemplateFieldFormComponent implements OnInit {
    private notificationCenter = inject(NotificationCenterService);
    public dialogRef = inject<MatDialogRef<DocumentTemplateFieldFormComponent>>(MatDialogRef);
    public data = inject<TemplateChildDialogData>(MAT_DIALOG_DATA);

    private dialog = inject(MatDialog);
    private service = inject(DocumentTemplateService);
    private cdr = inject(ChangeDetectorRef);

    field: DocumentoPlantillaCaracteristicaDTO = new DocumentoPlantillaCaracteristicaDTO();
    cargando = false;
    formatos = Object.keys(FormatoCampoSimboloEnum) as (keyof typeof FormatoCampoSimboloEnum)[];

    ngOnInit(): void {
        if (this.data?.id) {
            this.loadField(this.data.id);
            return;
        }
        this.field = new DocumentoPlantillaCaracteristicaDTO();
        this.field.estado = 'A';
        this.field.tipo = 'T';
        this.field.nodoSuperior = this.data.templateId;
    }

    private loadField(id: string): void {
        this.cargando = true;
        this.service.getFieldById(id).subscribe({
            next: (result) => {
                this.cargando = false;
                if (!result) {
                    this.notificationCenter.error('Campo no encontrado', 'No existe un campo con la clave solicitada.');
                    this.dialogRef.close();
                    return;
                }
                this.field = { ...result };
                this.field.propiedades = this.field.propiedades || [];
                this.cdr.markForCheck();
            },
            error: () => {
                this.cargando = false;
                this.notificationCenter.error('Error', 'No se pudo cargar el campo.');
                this.dialogRef.close();
            }
        });
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
          origenCategoria: this.field.tipo,
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
                this.notificationCenter.fire('Éxito', 'Campo guardado correctamente', 'success');
                this.dialogRef.close(result);
            },
            error: (err) => {
                this.cargando = false;
            }
        });
    }
}
