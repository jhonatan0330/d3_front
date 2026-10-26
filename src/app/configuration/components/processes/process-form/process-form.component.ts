import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { ProcesoDTO, ProcesoEstadoDTO, ProcesoTransicionDTO } from 'app/document/document.types';
import { ProcessService } from 'app/configuration/configuracion.api';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';
import { PropertyPanelComponent } from '../../shared/property-panel/property-panel.component';
import { ProcessSelectorComponent } from '../../shared/process-selector/process-selector.component';
import { ProcessTransitionListComponent } from '../process-transitions/process-transition-list/process-transition-list.component';
import { ProcessStateListComponent } from '../process-states/process-state-list/process-state-list.component';
import { ImageUploaderComponent } from 'app/upload/components/image-uploader/image-uploader.component';
import { IdDialogData } from '../../shared/dialog-data';

@Component({
    selector: 'app-process-form',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatTabsModule, MatIconModule, ProcessSelectorComponent, ProcessTransitionListComponent, ProcessStateListComponent, ImageUploaderComponent],
    templateUrl: './process-form.component.html',
})
export class ProcessFormComponent implements OnInit {
    private notificationCenter = inject(NotificationCenterService);
    public dialogRef = inject<MatDialogRef<ProcessFormComponent>>(MatDialogRef);
    public data = inject<IdDialogData | null>(MAT_DIALOG_DATA);

    private service = inject(ProcessService);
    private dialog = inject(MatDialog);
    private cdr = inject(ChangeDetectorRef);

    process: ProcesoDTO = new ProcesoDTO();
    cargando = false;
    activeTab = signal(0);

    ngOnInit(): void {
        if (this.data?.id) {
            this.loadProcess(this.data.id);
            return;
        }
        this.process = new ProcesoDTO();
        this.process.estado = 'A';

    }

    private loadProcess(id: string): void {
        this.cargando = true;
        this.service.getProcessById(id).subscribe({
            next: (result) => {
                this.cargando = false;
                if (!result) {
                    this.notificationCenter.error('Proceso no encontrado', 'No existe un proceso con la clave solicitada.');
                    this.dialogRef.close();
                    return;
                }
                this.process = {
                    ...result,
                };
                this.cdr.markForCheck();
            },
            error: () => {
                this.cargando = false;
                this.notificationCenter.error('Error', 'No se pudo cargar el proceso.');
                this.dialogRef.close();
            }
        });
    }

    openPropiedades(): void {
        if (!this.process.llaveTabla) return;
        this.dialog.open(PropertyPanelComponent, {
            width: '800px', maxWidth: '95vw', maxHeight: '90vh', disableClose: true,
            data: { campoKey: this.process.llaveTabla, tipoOrigen: 'P', titulo: this.process.nombre }
        });
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
            error: () => {
                this.cargando = false;
            }
        });
    }
}
