import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MensajePlantillaCorreoDTO } from 'app/document/document.types';
import { MessageTemplateService } from 'app/configuration/configuracion.api';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-message-template-form',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule, MatFormFieldModule, MatSelectModule],
    templateUrl: './message-template-form.component.html',
})
export class MessageTemplateFormComponent implements OnInit {
    public dialogRef = inject<MatDialogRef<MessageTemplateFormComponent>>(MatDialogRef);
    public data = inject<MensajePlantillaCorreoDTO | null>(MAT_DIALOG_DATA);

    private service = inject(MessageTemplateService);

    template: MensajePlantillaCorreoDTO = new MensajePlantillaCorreoDTO();
    cargando = false;

    ngOnInit(): void {
        if (this.data) {
            this.template = { ...this.data };
        } else {
            this.template = new MensajePlantillaCorreoDTO();
            this.template.estado = 'A';
        }
    }

    onSubmit(): void {
        this.cargando = true;

        const request$ = this.template.llaveTabla
            ? this.service.updateTemplate(this.template)
            : this.service.createTemplate(this.template);

        request$.subscribe({
            next: (result) => {
                this.cargando = false;
                Swal.fire('Éxito', 'Plantilla guardada correctamente', 'success');
                this.dialogRef.close(result);
            },
            error: (err) => {
                this.cargando = false;
                Swal.fire('Error', 'No se pudo guardar la plantilla', 'error');
            }
        });
    }
}