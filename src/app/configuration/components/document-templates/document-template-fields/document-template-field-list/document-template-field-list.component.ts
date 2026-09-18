import { Component, Input, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { DocumentoPlantillaDTO, DocumentoPlantillaCaracteristicaDTO } from 'app/document/document.types';
import { FormatoCampoSimboloEnum, DocumentoPlantillaCaracteristicaEnum } from 'app/document/form/form.enum';
import { DocumentTemplateService } from 'app/configuration/configuracion.api';
import { DocumentTemplateFieldFormComponent } from '../document-template-field-form/document-template-field-form.component';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-document-template-field-list',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule, MatTooltipModule, MatTableModule, DragDropModule],
    templateUrl: './document-template-field-list.component.html',
    styleUrl: './document-template-field-list.component.scss'
})
export class DocumentTemplateFieldListComponent implements OnInit {
    private service = inject(DocumentTemplateService);
    private dialog = inject(MatDialog);

    @Input() templateKey!: string;
    @Input() template!: DocumentoPlantillaDTO;
    @Output() fieldSaved = new EventEmitter<DocumentoPlantillaCaracteristicaDTO>();

    fields = signal<DocumentoPlantillaCaracteristicaDTO[]>([]);
    loading = signal(false);
    formatos = Object.keys(FormatoCampoSimboloEnum) as (keyof typeof FormatoCampoSimboloEnum)[];

    ngOnInit(): void {
        if (this.templateKey) {
            this.loadFields();
        }
    }

    loadFields(): void {
        this.loading.set(true);
        this.service.getTemplateFields(this.templateKey).subscribe({
            next: (res) => { this.fields.set(res); this.loading.set(false); },
            error: () => this.loading.set(false)
        });
    }

    openFieldForm(field?: DocumentoPlantillaCaracteristicaDTO): void {
        const dialogRef = this.dialog.open(DocumentTemplateFieldFormComponent, {
            width: '600px', maxWidth: '90vw', disableClose: true,
            data: { field: field ? { ...field } : null, template: this.template }
        });
        dialogRef.afterClosed().subscribe((result: DocumentoPlantillaCaracteristicaDTO) => {
            if (result) {
                this.fieldSaved.emit(result);
                this.loadFields();
            }
        });
    }

    drop(event: CdkDragDrop<DocumentoPlantillaCaracteristicaDTO[]>): void {
        moveItemInArray(this.fields(), event.previousIndex, event.currentIndex);
        const updatedFields = this.fields();
        updatedFields.forEach((f, i) => { f.orden = i + 1; });
        this.fields.set([...updatedFields]);

        const movedField = updatedFields[event.currentIndex];
        this.service.updateField(movedField).subscribe();
    }

    toggleFormat(field: DocumentoPlantillaCaracteristicaDTO): void {
        const currentIndex = this.formatos.indexOf(field.formato as keyof typeof FormatoCampoSimboloEnum);
        const nextIndex = (currentIndex + 1) % this.formatos.length;
        field.formato = this.formatos[nextIndex];
        this.service.updateField(field).subscribe({
            next: () => this.loadFields()
        });
    }

    deleteField(field: DocumentoPlantillaCaracteristicaDTO): void {
        Swal.fire({ title: '¿Eliminar campo?', text: 'Esta acción no se puede deshacer.', icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar' })
            .then((result) => { if (result.isConfirmed) { this.service.inactivateField(field).subscribe({ next: () => { Swal.fire('Eliminado', 'Campo eliminado correctamente', 'success'); this.loadFields(); }, error: () => Swal.fire('Error', 'No se pudo eliminar el campo', 'error') }); }});
    }

    getFormatoIcon(formato: string): string {
        return FormatoCampoSimboloEnum[formato as keyof typeof FormatoCampoSimboloEnum] ?? '?';
    }

    getFormatoLabel(formato: string): string {
        const entry = Object.entries(DocumentoPlantillaCaracteristicaEnum).find(([key, value]) => value === formato);
        return entry ? entry[0] : formato;
    }

    getFieldPreview(field: DocumentoPlantillaCaracteristicaDTO): string {
        const parts: string[] = [];
        if (field.codigo) parts.push(`Código: ${field.codigo}`);
        if (field.orden) parts.push(`Orden: ${field.orden}`);
        if (field.imagen) parts.push('Con imagen');
        return parts.join(' | ') || 'Sin detalles';
    }
}