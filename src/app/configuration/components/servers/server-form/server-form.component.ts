import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ServidorDTO } from 'app/document/document.types';
import { ServerService } from 'app/configuration/configuracion.api';
import { PropertyPanelComponent } from '../../shared/property-panel/property-panel.component';
import { MatIconModule } from '@angular/material/icon';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';
import { IdDialogData } from '../../shared/dialog-data';

@Component({
    selector: 'app-server-form',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatFormFieldModule, MatSelectModule, MatIconModule],
    templateUrl: './server-form.component.html',
})
export class ServerFormComponent implements OnInit {
    public dialogRef = inject<MatDialogRef<ServerFormComponent>>(MatDialogRef);
    public data = inject<IdDialogData | null>(MAT_DIALOG_DATA);

    private service = inject(ServerService);
    private dialog = inject(MatDialog);
    private cdr = inject(ChangeDetectorRef);

    servidor: ServidorDTO = new ServidorDTO();
    cargando = false;

    private notificationCenter = inject(NotificationCenterService);

    ngOnInit(): void {
        if (this.data?.id) {
            this.loadServidor(this.data.id);
            return;
        }
        this.servidor = new ServidorDTO();
        this.servidor.estado = 'A';
    }

    private loadServidor(id: string): void {
        this.cargando = true;
        this.service.getServidorById(id).subscribe({
            next: (result) => {
                this.cargando = false;
                if (!result) {
                    this.notificationCenter.error('Servidor no encontrado', 'No existe un servidor con la clave solicitada.');
                    this.dialogRef.close();
                    return;
                }
                this.servidor = { ...result };
                this.cdr.markForCheck();
            },
            error: () => {
                this.cargando = false;
                this.notificationCenter.error('Error', 'No se pudo cargar el servidor.');
                this.dialogRef.close();
            }
        });
    }

    openPropiedades(): void {
        if (!this.servidor.llaveTabla) return;
        this.dialog.open(PropertyPanelComponent, {
            disableClose: true,
            width: '800px', maxWidth: '95vw', maxHeight: '90vh',
            data: { campoKey: this.servidor.llaveTabla, tipoOrigen: 'S', titulo: this.servidor.nombre }
        });
    }

    onSubmit(): void {
        this.cargando = true;

        const request$ = this.servidor.llaveTabla
            ? this.service.updateServidor(this.servidor)
            : this.service.createServidor(this.servidor);

        request$.subscribe({
            next: (result) => {
                this.cargando = false;
                this.notificationCenter.fire('Éxito', 'Servidor guardado correctamente', 'success');
                this.dialogRef.close(result);
            },
            error: () => {
                this.cargando = false;
                
            }
        });
    }
}
