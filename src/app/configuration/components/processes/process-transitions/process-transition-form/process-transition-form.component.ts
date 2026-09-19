import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ProcesoDTO, ProcesoTransicionDTO } from 'app/document/document.types';
import { ProcessService } from 'app/configuration/configuracion.api';
import { PropertyPanelComponent } from '../../../shared/property-panel/property-panel.component';
import { ImageUploaderComponent } from 'app/upload/components/image-uploader/image-uploader.component';
import { MatIconModule } from '@angular/material/icon';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';

interface TransitionFormData {
    transition?: ProcesoTransicionDTO;
    process: ProcesoDTO;
}

@Component({
    selector: 'app-process-transition-form',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule, ImageUploaderComponent],
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

    ngOnInit(): void {
        if (this.data.transition) {
            this.transition = { ...this.data.transition };
        } else {
            this.transition = new ProcesoTransicionDTO();
            this.transition.estado = 'A';
            this.transition.proceso = this.data.process.llaveTabla;
            this.transition.documentador = false;
            this.transition.rapida = false;
            this.transition.estadoPartidaOrden = 0;
            this.transition.estadoLlegadaOrden = 0;
        }
    }

    openPropiedades(): void {
        if (!this.transition.llaveTabla) return;
        this.dialog.open(PropertyPanelComponent, {
            width: '800px', maxWidth: '95vw', maxHeight: '90vh', disableClose: true,
            data: { campoKey: this.transition.llaveTabla, tipoOrigen: 'T', titulo: this.transition.nombre }
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
            error: (err) => {
                this.cargando = false;
                this.notificationCenter.fire('Error', 'No se pudo guardar la transición', 'error');
            }
        });
    }
}
