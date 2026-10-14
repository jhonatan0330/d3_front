import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ProcesoDTO, ProcesoTransicionDTO } from 'app/document/document.types';
import { ProcessService } from 'app/configuration/configuracion.api';
import { PropertyPanelComponent } from '../../../shared/property-panel/property-panel.component';
import { ProcessSelectorComponent } from '../../../shared/process-selector/process-selector.component';
import { StateSelectorComponent } from '../../../shared/state-selector/state-selector.component';
import { TemplateSelectorComponent } from '../../../shared/template-selector/template-selector.component';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';
import { DocumentTemplateFormComponent } from '../../../document-templates/document-template-form/document-template-form.component';

interface TransitionFormData {
    transition?: ProcesoTransicionDTO;
    process?: ProcesoDTO;
}

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
    public data = inject<TransitionFormData>(MAT_DIALOG_DATA);

    private service = inject(ProcessService);
    private dialog = inject(MatDialog);

    transition: ProcesoTransicionDTO = new ProcesoTransicionDTO();
    cargando = false;
    esEdicion = false;
    processKey = '';

    afectaSaldoOpciones = [
        { value: 'R', label: 'RESTANDO' },
        { value: 'S', label: 'SUMANDO' },
    ];

    ngOnInit(): void {
        if (this.data.transition?.llaveTabla) {
            this.transition = { ...this.data.transition };
            this.esEdicion = true;
        } else {
            this.transition = new ProcesoTransicionDTO();
            this.transition.estado = 'A';
            this.transition.documentador = false;
            this.transition.rapida = false;
            this.transition.estadoPartidaOrden = 0;
            this.transition.estadoLlegadaOrden = 0;
        }
        this.transition.proceso = this.data.process?.llaveTabla || this.transition.proceso || '';
        this.processKey = this.transition.proceso;
    }

    onProcessChange(llave: string): void {
        this.transition.proceso = llave;
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
            data: { template: this.transition.plantilla },
            width: '900px',
            maxWidth: '95vw',
            maxHeight: '95vh',
        });
    }

    onSubmit(): void {
        this.cargando = true;

        const request$ = this.transition.llaveTabla
            ? this.service.updateTransition(this.transition)
            : this.service.createTransition(this.transition);

        request$.subscribe({
            next: (result) => {
                this.cargando = false;
                this.notificationCenter.fire('Éxito', 'Transición guardada correctamente', 'success');
                this.dialogRef.close(result);
            },
            error: () => {
                this.cargando = false;
            }
        });
    }
}
