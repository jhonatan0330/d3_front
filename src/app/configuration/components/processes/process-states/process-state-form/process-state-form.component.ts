import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ProcesoDTO, ProcesoEstadoDTO } from 'app/document/document.types';
import { ProcessService } from 'app/configuration/configuracion.api';
import { PropertyPanelComponent } from '../../../shared/property-panel/property-panel.component';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';
import { PROCESO_ESTADO_TIPO_LABELS, PROCESO_ESTADO_DOCUMENTO_LABELS } from '../process-state-list/process-state-list.component';

interface StateFormData {
    state?: ProcesoEstadoDTO;
    process: ProcesoDTO;
}

@Component({
    selector: 'app-process-state-form',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule, MatSelectModule, MatFormFieldModule],
    templateUrl: './process-state-form.component.html',
})
export class ProcessStateFormComponent implements OnInit {
    private notificationCenter = inject(NotificationCenterService);
    public dialogRef = inject<MatDialogRef<ProcessStateFormComponent>>(MatDialogRef);
    public data = inject<StateFormData>(MAT_DIALOG_DATA);

    private service = inject(ProcessService);
    private dialog = inject(MatDialog);

    state: ProcesoEstadoDTO = new ProcesoEstadoDTO();
    cargando = false;

    tipoOpciones = Object.entries(PROCESO_ESTADO_TIPO_LABELS).map(([value, label]) => ({ value, label }));
    estadoDocumentoOpciones = Object.entries(PROCESO_ESTADO_DOCUMENTO_LABELS).map(([value, label]) => ({ value, label }));

    ngOnInit(): void {
        if (this.data.state) {
            this.state = { ...this.data.state };
        } else {
            this.state = new ProcesoEstadoDTO();
            this.state.estado = 'A';
            this.state.tipo = 'E';
            this.state.estadoDocumento = 'A';
            this.state.avance = 0;
            this.state.proceso = this.data.process?.llaveTabla;
        }
    }

    openPropiedades(): void {
        if (!this.state.llaveTabla) return;
        this.dialog.open(PropertyPanelComponent, {
            width: '800px', maxWidth: '95vw', maxHeight: '90vh', disableClose: true,
            data: { campoKey: this.state.llaveTabla, tipoOrigen: 'A', titulo: this.state.nombre }
        });
    }

    onSubmit(): void {
        this.cargando = true;

        const request$ = this.state.llaveTabla
            ? this.service.updateState(this.state)
            : this.service.createState(this.state);

        request$.subscribe({
            next: (result) => {
                this.cargando = false;
                this.notificationCenter.fire('Éxito', 'Estado guardado correctamente', 'success');
                this.dialogRef.close(result);
            },
            error: () => {
                this.cargando = false;
            }
        });
    }
}
