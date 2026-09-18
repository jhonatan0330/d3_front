import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ConsecutivoDTO } from 'app/document/document.types';
import { ConsecutiveService } from 'app/configuration/configuracion.api';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-consecutive-form',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule],
    templateUrl: './consecutive-form.component.html',
})
export class ConsecutiveFormComponent implements OnInit {
    public dialogRef = inject<MatDialogRef<ConsecutiveFormComponent>>(MatDialogRef);
    public data = inject<ConsecutivoDTO | null>(MAT_DIALOG_DATA);

    private service = inject(ConsecutiveService);

    consecutivo: ConsecutivoDTO = new ConsecutivoDTO();
    cargando = false;

    ngOnInit(): void {
        if (this.data) {
            this.consecutivo = { ...this.data };
        } else {
            this.consecutivo = new ConsecutivoDTO();
            this.consecutivo.estado = 'A';
            this.consecutivo.manual = false;
            this.consecutivo.numeroInicial = 0;
            this.consecutivo.numeroFinal = 0;
            this.consecutivo.numeroActual = 0;
            this.consecutivo.padding = 0;
            this.consecutivo.consecutivoActual = '';
        }
    }

    onSubmit(): void {
        this.cargando = true;

        const request$ = this.consecutivo.llaveTabla
            ? this.service.updateConsecutivo(this.consecutivo)
            : this.service.createConsecutivo(this.consecutivo);

        request$.subscribe({
            next: (result) => {
                this.cargando = false;
                Swal.fire('Éxito', 'Consecutivo guardado correctamente', 'success');
                this.dialogRef.close(result);
            },
            error: (err) => {
                this.cargando = false;
                Swal.fire('Error', 'No se pudo guardar el consecutivo', 'error');
            }
        });
    }
}