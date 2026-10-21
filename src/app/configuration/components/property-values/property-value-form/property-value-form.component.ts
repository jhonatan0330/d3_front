import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { PropiedadValorDefinidoDTO } from 'app/shared/shared.domain';
import { PropertyValueService } from 'app/configuration/configuracion.api';
import { ImageUploaderComponent } from 'app/upload/components/image-uploader/image-uploader.component';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';
import { IdDialogData } from '../../shared/dialog-data';

@Component({
    selector: 'app-property-value-form',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule, MatFormFieldModule, MatSelectModule, ImageUploaderComponent],
    templateUrl: './property-value-form.component.html',
})
export class PropertyValueFormComponent implements OnInit {
    private notificationCenter = inject(NotificationCenterService);
    public dialogRef = inject<MatDialogRef<PropertyValueFormComponent>>(MatDialogRef);
    public data = inject<IdDialogData | null>(MAT_DIALOG_DATA);

    private service = inject(PropertyValueService);
    private cdr = inject(ChangeDetectorRef);

    valor: PropiedadValorDefinidoDTO = new PropiedadValorDefinidoDTO();
    cargando = false;

    ngOnInit(): void {
        if (this.data?.id) {
            this.loadValor(this.data.id);
            return;
        }
        this.valor = new PropiedadValorDefinidoDTO();
        this.valor.estado = 'A';
        this.valor.pideRol = false;
        this.valor.pideUsuario = false;
        this.valor.pideFechas = false;
        this.valor.pideTiempoBloqueo = false;
        this.valor.multiple = false;
        this.valor.propiedadBoolean = false;
        this.valor.necesitaDesarrollo = false;
        this.valor.textOculto = false;
        this.valor.incluirPreloadOrigen = false;
        this.valor.privada = false;
        this.valor.usoMotivo = '';
        this.valor.imagen = '';
        this.valor.usoRelaciones = '';
    }

    private loadValor(id: string): void {
        this.cargando = true;
        this.service.getPropertyValueById(id).subscribe({
            next: (result) => {
                this.cargando = false;
                if (!result) {
                    this.notificationCenter.error('Valor no encontrado', 'No existe un valor de propiedad con la clave solicitada.');
                    this.dialogRef.close();
                    return;
                }
                this.valor = { ...result };
                this.cdr.markForCheck();
            },
            error: () => {
                this.cargando = false;
                this.notificationCenter.error('Error', 'No se pudo cargar el valor de la propiedad.');
                this.dialogRef.close();
            }
        });
    }

    onSubmit(): void {
        this.cargando = true;

        const request$ = this.valor.llaveTabla
            ? this.service.updatePropertyValue(this.valor)
            : this.service.createPropertyValue(this.valor);

        request$.subscribe({
            next: (result) => {
                this.cargando = false;
                this.notificationCenter.fire('Éxito', 'Valor guardado correctamente', 'success');
                this.dialogRef.close(result);
            },
            error: () => {
                this.cargando = false;
                
            }
        });
    }
}
