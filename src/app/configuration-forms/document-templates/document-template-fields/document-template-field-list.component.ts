import { Component, Input, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { DocumentoPlantillaDTO, DocumentoPlantillaCaracteristicaDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { FormatoCampoSimboloEnum, DocumentoPlantillaCaracteristicaEnum } from 'app/modules/full/neuron/model/sw42.enum';
import { DocumentTemplateService } from '../document-template.service';
import { DocumentTemplateFieldFormComponent } from './document-template-field-form.component';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-document-template-field-list',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule, MatTooltipModule, MatTableModule, DragDropModule],
    template: `
    <div class="flex flex-col h-full">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold">Campos de la Plantilla</h3>
        <button type="button" class="btn-flat-primary" (click)="openFieldForm()"><mat-icon>add</mat-icon> Agregar Campo</button>
      </div>

      @if (loading()) {
        <div class="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
          <div class="h-full bg-primary rounded animate-pulse" style="width: 40%;"></div>
        </div>
      } @else if (fields().length === 0) {
        <div class="flex-1 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
          <mat-icon class="text-6xl mb-4">dynamic_form</mat-icon>
          <p class="text-lg">No hay campos configurados</p>
          <button type="button" class="btn-flat-primary mt-4" (click)="openFieldForm()"><mat-icon>add</mat-icon> Crear primer campo</button>
        </div>
      } @else {
        <div class="flex-1 overflow-y-auto">
          <div class="space-y-2" cdkDropList (cdkDropListDropped)="drop($event)">
            @for (field of fields(); track field.llaveTabla; let i = $index) {
              <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800 flex items-center gap-3 cdk-drag" cdkDrag [cdkDragData]="field">
                <div class="cdk-drag-handle cursor-move p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Arrastrar para reordenar">
                  <mat-icon>drag_indicator</mat-icon>
                </div>
                <div class="w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <span class="text-2xl">{{ getFormatoIcon(field.formato) }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="font-medium text-gray-900 dark:text-gray-100 truncate">{{ field.nombre }}</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400 font-mono">{{ field.codigo }}</span>
                    <span class="badge badge-info text-xs">{{ getFormatoLabel(field.formato) }}</span>
                    @if (field.editando) { <span class="badge badge-warning text-xs">Editando</span> }
                  </div>
                  <div class="text-sm text-gray-600 dark:text-gray-300 truncate">{{ getFieldPreview(field) }}</div>
                </div>
                <div class="flex items-center gap-1">
                  <button type="button" class="btn-icon btn-flat-primary" (click)="openFieldForm(field)" aria-label="Editar"><mat-icon>edit</mat-icon></button>
                  <button type="button" class="btn-icon" (click)="toggleFormat(field)" aria-label="Cambiar formato" matTooltip="Cambiar formato"><mat-icon>swap_horiz</mat-icon></button>
                  <button type="button" class="btn-icon btn-flat-accent" (click)="deleteField(field)" aria-label="Eliminar"><mat-icon>delete</mat-icon></button>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
    styles: [`
    .btn-flat-primary { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; border-radius: 4px; font-weight: 500; background: #3f51b5; color: white; border: none; }
    .btn-flat-primary:hover { background: #303f9f; }
    .btn-icon { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 50%; border: none; background: transparent; color: #666; cursor: pointer; }
    .btn-icon:hover { background: #f5f5f5; color: #333; }
    .btn-flat-accent { background: #f44336; color: white; }
    .btn-flat-accent:hover { background: #d32f2f; }
    .badge { padding: 0.125rem 0.5rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 500; }
    .badge-info { background: #e3f2fd; color: #1565c0; }
    .badge-warning { background: #fff3e0; color: #ef6c00; }
    :host ::ng-deep .cdk-drag-preview { box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    :host ::ng-deep .cdk-drag-animating { transition: transform 250ms cubic-bezier(0, 0, 0.2, 1); }
    :host ::ng-deep .cdk-drag-placeholder { opacity: 0.5; background: #e0e0e0; border: 2px dashed #999; }
    .dark :host ::ng-deep .cdk-drag-placeholder { background: #333; border-color: #666; }
  `]
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
            width: '600px', maxWidth: '90vw',
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