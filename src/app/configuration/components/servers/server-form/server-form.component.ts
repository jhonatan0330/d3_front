import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ServidorDTO } from 'app/document/document.types';
import { ServerService } from 'app/configuration/configuracion.api';
import { PropertyPanelComponent } from '../../shared/property-panel/property-panel.component';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-server-form',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatFormFieldModule, MatSelectModule, MatIconModule],
    templateUrl: './server-form.component.html',
})
export class ServerFormComponent implements OnInit {
    public dialogRef = inject<MatDialogRef<ServerFormComponent>>(MatDialogRef);
    public data = inject<ServidorDTO | null>(MAT_DIALOG_DATA);

    private service = inject(ServerService);
    private dialog = inject(MatDialog);

    servidor: ServidorDTO = new ServidorDTO();
    cargando = false;

    ngOnInit(): void {
        if (this.data) { this.servidor = { ...this.data }; }
        else {
            this.servidor = new ServidorDTO();
            this.servidor.estado = 'A';
        }
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
                Swal.fire('Éxito', 'Servidor guardado correctamente', 'success');
                this.dialogRef.close(result);
            },
            error: (err) => {
                this.cargando = false;
                Swal.fire('Error', 'No se pudo guardar el servidor', 'error');
            }
        });
    }
}