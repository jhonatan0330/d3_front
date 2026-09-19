import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { WebServiceDTO } from 'app/document/document.types';
import { WebServiceConfigService } from 'app/configuration/configuracion.api';
import { ProcessSelectorComponent } from '../../shared/process-selector/process-selector.component';
import { PropertyPanelComponent } from '../../shared/property-panel/property-panel.component';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';

@Component({
    selector: 'app-web-service-form',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule],
    templateUrl: './web-service-form.component.html',
})
export class WebServiceFormComponent implements OnInit {
    public dialogRef = inject<MatDialogRef<WebServiceFormComponent>>(MatDialogRef);
    public data = inject<WebServiceDTO | null>(MAT_DIALOG_DATA);
    private service = inject(WebServiceConfigService);
    private dialog = inject(MatDialog);
    private notificationCenter = inject(NotificationCenterService);

    ws: WebServiceDTO = new WebServiceDTO();
    cargando = false;

    ngOnInit(): void {
        if (this.data) {
            this.ws = { ...this.data };
        } else {
            this.ws = new WebServiceDTO();
            this.ws.estado = 'A';
        }
    }

    openPropiedades(): void {
        if (!this.ws.llaveTabla) return;
        this.dialog.open(PropertyPanelComponent, {
            disableClose: true,
            width: '800px', maxWidth: '95vw', maxHeight: '90vh',
            data: { campoKey: this.ws.llaveTabla, tipoOrigen: 'W', titulo: this.ws.nombre }
        });
    }

    onSubmit(): void {
        this.cargando = true;
        const request = this.ws.llaveTabla
            ? this.service.updateWebService(this.ws)
            : this.service.createWebService(this.ws);
        request.subscribe({
            next: (res) => {
                this.cargando = false;
                this.notificationCenter.fire('Éxito', this.ws.llaveTabla ? 'Web Service actualizado correctamente' : 'Web Service creado correctamente', 'success');
                this.dialogRef.close(res);
            },
            error: () => {
                this.cargando = false;
                this.notificationCenter.fire('Error', 'No se pudo guardar el web service', 'error');
            },
        });
    }
}
