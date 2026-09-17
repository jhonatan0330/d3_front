import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { WebServiceDTO, WebServiceEjecucionDTO } from 'app/document/document.types';
import { WebServiceConfigService } from 'app/configuration/configuracion.api';
import Swal from 'sweetalert2';

interface ExecuteDialogData {
    webService: WebServiceDTO;
}

@Component({
    selector: 'app-web-service-execute-dialog',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule],
    templateUrl: './web-service-execute-dialog.component.html',
    styleUrl: './web-service-execute-dialog.component.scss'
})
export class WebServiceExecuteDialogComponent implements OnInit {
    private service = inject(WebServiceConfigService);
    public dialogRef = inject<MatDialogRef<WebServiceExecuteDialogComponent>>(MatDialogRef);
    public data = inject<ExecuteDialogData>(MAT_DIALOG_DATA);

    parametros = '{}';
    lastExecution: WebServiceEjecucionDTO | null = null;
    cargando = false;

    ngOnInit(): void {
        this.loadLastExecution();
    }

    loadLastExecution(): void {
        this.service.getExecutionsByWebService(this.data.webService.llaveTabla).subscribe({
            next: (execs) => {
                if (execs.length > 0) {
                    this.lastExecution = execs[0];
                }
            }
        });
    }

    onExecute(): void {
        this.cargando = true;
        this.service.executeWebService(this.data.webService.llaveTabla, this.parametros).subscribe({
            next: (result) => {
                this.cargando = false;
                this.lastExecution = result;
                Swal.fire({
                    title: result.error ? 'Error' : 'Éxito',
                    text: result.error ? (result.error || 'Error en la ejecución') : 'Web Service ejecutado correctamente',
                    icon: result.error ? 'error' : 'success',
                    timer: 3000,
                    showConfirmButton: false
                });
            },
            error: (err) => {
                this.cargando = false;
                Swal.fire('Error', 'No se pudo ejecutar el web service', 'error');
            }
        });
    }
}