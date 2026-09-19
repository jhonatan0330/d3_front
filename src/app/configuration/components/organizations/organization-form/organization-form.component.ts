import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { OrganizacionDTO } from 'app/document/document.types';
import { OrganizationService } from 'app/configuration/configuracion.api';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';
import { PropertyPanelComponent } from '../../shared/property-panel/property-panel.component';
import { ImageUploaderComponent } from 'app/upload/components/image-uploader/image-uploader.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-organization-form',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule, ImageUploaderComponent],
    templateUrl: './organization-form.component.html',
})
export class OrganizationFormComponent implements OnInit {
    private notificationCenter = inject(NotificationCenterService);
    public dialogRef = inject<MatDialogRef<OrganizationFormComponent>>(MatDialogRef);
    public data = inject<OrganizacionDTO | null>(MAT_DIALOG_DATA);

    private service = inject(OrganizationService);
    private dialog = inject(MatDialog);

    organizacion: OrganizacionDTO = new OrganizacionDTO();
    cargando = false;

    ngOnInit(): void {
        if (this.data) {
            this.organizacion = { ...this.data };
        } else {
            this.organizacion = new OrganizacionDTO();
            this.organizacion.estado = 'A';
        }
    }

    openPropiedades(): void {
        if (!this.organizacion.llaveTabla) return;
        this.dialog.open(PropertyPanelComponent, {
            disableClose: true,
            width: '800px', maxWidth: '95vw', maxHeight: '90vh',
            data: { campoKey: this.organizacion.llaveTabla, tipoOrigen: 'O', titulo: this.organizacion.nombre }
        });
    }

    onSubmit(): void {
        this.cargando = true;

        const request$ = this.organizacion.llaveTabla
            ? this.service.updateOrganizacion(this.organizacion)
            : this.service.createOrganizacion(this.organizacion);

        request$.subscribe({
            next: (result) => {
                this.cargando = false;
                this.notificationCenter.fire('Éxito', 'Organización guardada correctamente', 'success');
                this.dialogRef.close(result);
            },
            error: (err) => {
                this.cargando = false;
                this.notificationCenter.fire('Error', 'No se pudo guardar la organización', 'error');
            }
        });
    }
}
