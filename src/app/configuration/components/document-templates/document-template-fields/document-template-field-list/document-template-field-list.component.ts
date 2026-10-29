import { Component, Input, Output, EventEmitter, OnInit, inject, signal, computed } from '@angular/core';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { DocumentoPlantillaCaracteristicaDTO } from 'app/document/document.types';
import { FormatoCampoSimboloEnum, DocumentoPlantillaCaracteristicaEnum } from 'app/document/form/form.enum';
import { DocumentTemplateService } from 'app/configuration/configuracion.api';
import { DocumentTemplateFieldFormComponent } from '../document-template-field-form/document-template-field-form.component';

@Component({
    selector: 'app-document-template-field-list',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule, MatTooltipModule, MatTableModule, DragDropModule],
    templateUrl: './document-template-field-list.component.html'
})
export class DocumentTemplateFieldListComponent implements OnInit {
    private notificationCenter = inject(NotificationCenterService);
    private service = inject(DocumentTemplateService);
    private dialog = inject(MatDialog);

    @Input() templateKey!: string;
    @Output() fieldSaved = new EventEmitter<DocumentoPlantillaCaracteristicaDTO>();

    fields = signal<DocumentoPlantillaCaracteristicaDTO[]>([]);
    loading = signal(false);
    mostrarInactivos = signal(false);

    activos = computed(() => this.fields().filter((f) => f.estado === 'A'));
    inactivos = computed(() => this.fields().filter((f) => f.estado !== 'A'));
    totalInactivos = computed(() => this.inactivos().length);

    ngOnInit(): void {
        if (this.templateKey) {
            this.loadFields();
        }
    }

    loadFields(): void {
        this.loading.set(true);
        this.service.getTemplateFields(this.templateKey, null).subscribe({
            next: (res) => { this.fields.set(res ?? []); this.loading.set(false); },
            error: () => this.loading.set(false)
        });
    }

    toggleInactivos(): void {
        this.mostrarInactivos.update((value) => !value);
    }

    openFieldForm(field?: DocumentoPlantillaCaracteristicaDTO): void {
        const dialogRef = this.dialog.open(DocumentTemplateFieldFormComponent, {
            width: '600px', maxWidth: '90vw', disableClose: true,
            data: { id: field?.llaveTabla, templateId: this.templateKey }
        });
        dialogRef.afterClosed().subscribe((result: DocumentoPlantillaCaracteristicaDTO) => {
            if (result) {
                this.fieldSaved.emit(result);
                this.loadFields();
            }
        });
    }

    drop(event: CdkDragDrop<DocumentoPlantillaCaracteristicaDTO[]>): void {
        if (event.previousIndex === event.currentIndex) {
            return;
        }

        const activos = [...this.activos()];
        moveItemInArray(activos, event.previousIndex, event.currentIndex);

        const siguientes = [...this.fields()];
        const activosKey = new Set(activos.map((field) => field.llaveTabla));

        const reorderedFields = [
            ...activos,
            ...siguientes.filter((field) => !activosKey.has(field.llaveTabla))
        ];

        const prioridades = new Map(activos.map((field, index) => [field.llaveTabla, index + 1]));

        this.fields.set(reorderedFields.map((field) => {
            const prioridad = prioridades.get(field.llaveTabla);
            return prioridad && field.estado === 'A' ? { ...field, prioridad } : field;
        }));

        const movedField = { ...activos[event.currentIndex], prioridad: event.currentIndex + 1 };
        if (!movedField.nodoSuperior) {
            movedField.nodoSuperior = this.templateKey;
        }

        this.service.updateField(movedField).subscribe({
            next: () => {
                this.loadFields();
            },
            error: () => this.loadFields()
        });
    }

    reactivarField(field: DocumentoPlantillaCaracteristicaDTO): void {
        this.notificationCenter.fire({
            title: '¿Reactivar campo?',
            text: `El campo "${field.nombre}" volverá a estar disponible en la plantilla.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, reactivar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.service.activateField(field).subscribe({
                    next: () => {
                        this.notificationCenter.fire('Reactivado', 'Campo reactivado correctamente', 'success');
                        this.loadFields();
                    }
                });
            }
        });
    }

    deleteField(field: DocumentoPlantillaCaracteristicaDTO): void {
        this.notificationCenter.fire({ title: '¿Eliminar campo?', text: 'Esta acción no se puede deshacer.', icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar' })
            .then((result) => { if (result.isConfirmed) { this.service.inactivateField(field).subscribe({ next: () => { this.notificationCenter.fire('Eliminado', 'Campo eliminado correctamente', 'success'); this.loadFields(); } }); }});
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
        if (field.prioridad) parts.push(`Orden: ${field.prioridad}`);
        return parts.join(' | ') || 'Sin detalles';
    }
}
