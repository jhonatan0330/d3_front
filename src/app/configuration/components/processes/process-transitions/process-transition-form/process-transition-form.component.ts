import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { finalize } from 'rxjs';
import { ProcesoTransicionDTO } from 'app/document/document.types';
import { ProcessService } from 'app/configuration/configuracion.api';
import { PropertyPanelComponent } from '../../../shared/property-panel/property-panel.component';
import { ProcessSelectorComponent } from '../../../shared/process-selector/process-selector.component';
import { StateSelectorComponent } from '../../../shared/state-selector/state-selector.component';
import { TemplateSelectorComponent } from '../../../shared/template-selector/template-selector.component';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';
import { DocumentTemplateFormComponent } from '../../../document-templates/document-template-form/document-template-form.component';
import { ProcessChildDialogData } from '../../../shared/dialog-data';

@Component({
    selector: 'app-process-transition-form',
    standalone: true,
    imports: [
        CommonModule, FormsModule, MatDialogModule, MatIconModule,
        ProcessSelectorComponent, StateSelectorComponent, TemplateSelectorComponent,
    ],
    templateUrl: './process-transition-form.component.html',
})
export class ProcessTransitionFormComponent implements OnInit {
    private notificationCenter = inject(NotificationCenterService);
    public dialogRef = inject<MatDialogRef<ProcessTransitionFormComponent>>(MatDialogRef);
    public data = inject<ProcessChildDialogData>(MAT_DIALOG_DATA);

    private service = inject(ProcessService);
    private dialog = inject(MatDialog);

    transition: ProcesoTransicionDTO = new ProcesoTransicionDTO();
    cargando = signal(false);
    esEdicion = false;
    processKey = '';

    ngOnInit(): void {
        if (this.data?.id) {
            this.loadTransition(this.data.id);
            return;
        }
        this.transition = new ProcesoTransicionDTO();
        this.transition.estado = 'A';
        this.transition.estadoPartidaOrden = 0;
        this.transition.estadoLlegadaOrden = 0;
        this.transition.nodoSuperior = this.data.processId;
        this.processKey = this.transition.nodoSuperior;
    }

    private loadTransition(id: string): void {
        this.cargando.set(true);
        this.service.getTransitionById(id).pipe(finalize(() => this.cargando.set(false))).subscribe({
            next: (result) => {
                if (!result) {
                    this.notificationCenter.error('Transición no encontrada', 'No existe una transición con la clave solicitada.');
                    this.dialogRef.close();
                    return;
                }
                this.transition = { ...result };
                this.processKey = this.transition.nodoSuperior;
                this.esEdicion = true;
            },
            error: () => {
                this.notificationCenter.error('Error', 'No se pudo cargar la transición.');
                this.dialogRef.close();
            }
        });
    }

    onProcessChange(llave: string): void {
        if (this.transition.nodoSuperior !== llave) {
            this.transition.estadoPartida = null!;
            this.transition.estadoPartidaNombre = null!;
            this.transition.estadoLLegada = null!;
            this.transition.estadoLlegadaNombre = null!;
        }
        this.transition.nodoSuperior = llave;
        this.processKey = llave;
    }

    openPropiedades(): void {
        if (!this.transition.llaveTabla) return;
        this.dialog.open(PropertyPanelComponent, {
            width: '800px', maxWidth: '95vw', maxHeight: '90vh', disableClose: true,
            data: { campoKey: this.transition.llaveTabla, tipoOrigen: 'T', titulo: this.transition.nombre }
        });
    }

    abrirPlantilla(): void {
        if (!this.transition.plantilla) return;
        this.dialog.open(DocumentTemplateFormComponent, {
            data: { id: this.transition.plantilla },
            width: '900px',
            maxWidth: '95vw',
            maxHeight: '95vh',
        });
    }

    onSubmit(): void {
        this.cargando.set(true);

        const request$ = this.transition.llaveTabla
            ? this.service.updateTransition(this.transition)
            : this.service.createTransition(this.transition);

        request$.pipe(finalize(() => this.cargando.set(false))).subscribe({
            next: (result) => {
                this.notificationCenter.fire('Éxito', 'Transición guardada correctamente', 'success');
                this.dialogRef.close(result);
            },
            error: () => { }
        });
    }
}
