import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { ProcesoDTO, ProcesoTransicionDTO } from 'app/document/document.types';
import { ProcessService } from 'app/configuration/configuracion.api';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';
import { PropertyPanelComponent } from '../../shared/property-panel/property-panel.component';
import { ProcessSelectorComponent } from '../../shared/process-selector/process-selector.component';
import { ProcessTransitionListComponent } from '../process-transitions/process-transition-list/process-transition-list.component';
import { ImageUploaderComponent } from 'app/upload/components/image-uploader/image-uploader.component';

@Component({
    selector: 'app-process-form',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatTabsModule, MatIconModule, ProcessSelectorComponent, ProcessTransitionListComponent, ImageUploaderComponent],
    templateUrl: './process-form.component.html',
})
export class ProcessFormComponent implements OnInit {
    private notificationCenter = inject(NotificationCenterService);
    public dialogRef = inject<MatDialogRef<ProcessFormComponent>>(MatDialogRef);
    public data = inject<ProcesoDTO | null>(MAT_DIALOG_DATA);

    private service = inject(ProcessService);
    private dialog = inject(MatDialog);

    process: ProcesoDTO = new ProcesoDTO();
    cargando = false;
    activeTab = signal(0);

    ngOnInit(): void {
        if (this.data) {
            this.process = { ...this.data };
            if (!this.process.transiciones) this.process.transiciones = [];
        } else {
            this.process = new ProcesoDTO();
            this.process.estado = 'A';
            this.process.transiciones = [];
        }
    }

    openPropiedades(): void {
        if (!this.process.llaveTabla) return;
        this.dialog.open(PropertyPanelComponent, {
            width: '800px', maxWidth: '95vw', maxHeight: '90vh', disableClose: true,
            data: { campoKey: this.process.llaveTabla, tipoOrigen: 'P', titulo: this.process.nombre }
        });
    }

    onTransitionSaved(transition: ProcesoTransicionDTO): void {
        if (!this.process.transiciones) this.process.transiciones = [];
        const idx = this.process.transiciones.findIndex(t => t.llaveTabla === transition.llaveTabla);
        if (idx >= 0) this.process.transiciones[idx] = transition;
        else this.process.transiciones.push(transition);
    }

    onSubmit(): void {
        this.cargando = true;

        const request$ = this.process.llaveTabla
            ? this.service.updateProcess(this.process)
            : this.service.createProcess(this.process);

        request$.subscribe({
            next: (result) => {
                this.cargando = false;
                this.notificationCenter.fire('Éxito', 'Proceso guardado correctamente', 'success');
                this.dialogRef.close(result);
            },
            error: (err) => {
                this.cargando = false;
                this.notificationCenter.fire('Error', 'No se pudo guardar el proceso', 'error');
            }
        });
    }
}
