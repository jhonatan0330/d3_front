import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ProcesoEstadoDTO } from 'app/document/document.types';
import { ProcessService } from 'app/configuration/configuracion.api';
import { PropertyPanelComponent } from '../../../shared/property-panel/property-panel.component';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';
import { PROCESO_ESTADO_TIPO_LABELS, PROCESO_ESTADO_DOCUMENTO_LABELS } from '../process-state-list/process-state-list.component';
import { ProcessChildDialogData } from '../../../shared/dialog-data';

@Component({
    selector: 'app-process-state-form',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule, MatSelectModule, MatFormFieldModule],
    templateUrl: './process-state-form.component.html',
})
export class ProcessStateFormComponent implements OnInit {
    private notificationCenter = inject(NotificationCenterService);
    public dialogRef = inject<MatDialogRef<ProcessStateFormComponent>>(MatDialogRef);
    public data = inject<ProcessChildDialogData>(MAT_DIALOG_DATA);

    private service = inject(ProcessService);
    private dialog = inject(MatDialog);
    private cdr = inject(ChangeDetectorRef);

    state: ProcesoEstadoDTO = new ProcesoEstadoDTO();
    cargando = false;

    tipoOpciones = Object.entries(PROCESO_ESTADO_TIPO_LABELS).map(([value, label]) => ({ value, label }));
    estadoDocumentoOpciones = Object.entries(PROCESO_ESTADO_DOCUMENTO_LABELS).map(([value, label]) => ({ value, label }));

    ngOnInit(): void {
        if (this.data?.id) {
            this.loadState(this.data.id);
            return;
        }
        this.state = new ProcesoEstadoDTO();
        this.state.estado = 'A';
        this.state.tipo = 'E';
        this.state.estadoDocumento = 'A';
        this.state.prioridad = 0;
        this.state.nodoSuperior = this.data.processId;
    }

    private loadState(id: string): void {
        this.cargando = true;
        this.service.getStateById(id).subscribe({
            next: (result) => {
                this.cargando = false;
                if (!result) {
                    this.notificationCenter.error('Estado no encontrado', 'No existe un estado con la clave solicitada.');
                    this.dialogRef.close();
                    return;
                }
                this.state = { ...result };
                this.cdr.markForCheck();
            },
            error: () => {
                this.cargando = false;
                this.notificationCenter.error('Error', 'No se pudo cargar el estado.');
                this.dialogRef.close();
            }
        });
    }

    openPropiedades(): void {
        if (!this.state.llaveTabla) return;
        this.dialog.open(PropertyPanelComponent, {
            width: '800px', maxWidth: '95vw', maxHeight: '90vh', disableClose: true,
            data: { campoKey: this.state.llaveTabla, tipoOrigen: 'A',  origenCategoria: this.state.tipo, titulo: this.state.nombre }
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
