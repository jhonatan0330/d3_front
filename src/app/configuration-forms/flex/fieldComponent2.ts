import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlexService } from '../flex.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DocumentoPlantillaCaracteristicaDTO } from 'app/modules/full/neuron/model/sw42.domain';

@Component({
    selector: 'app-campo-form',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './fieldComponent2.html',
})
export class FieldComponent2 {
    campo: DocumentoPlantillaCaracteristicaDTO;

    imagenPreview: string | null = null;
    cargando = false;

    constructor(
        private flexService: FlexService,
        @Inject(MAT_DIALOG_DATA) public data: any,

    ) { }

    ngOnInit(): void {
        this.flexService.getField(this.data.template, null)
            .subscribe(p => {
                this.campo = p;
            });
    }




    onSeleccionarImagen(event: Event): void {
        /*const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.campo.imagen = input.files[0].text();

            // Mostrar preview
            const reader = new FileReader();
            reader.onload = (e) => (this.imagenPreview = e.target?.result as string);
            reader.readAsDataURL(this.campo.imagen);
        }*/
    }

    /**
     * Simula la acción de abrir cámara o cargar imagen
     */
    cargarImagenDesdeCamara(): void {
        alert('📷 Función de cámara aún no implementada');
    }

    /**
     * Envía los datos del formulario
     */
    actualizarCampo(): void {
        if (!this.campo.nombre || !this.campo.codigo) {
            alert('⚠️ Los campos nombre y código son obligatorios.');
            return;
        }

        this.cargando = true;

        // Simular envío al servidor (puedes reemplazar con tu servicio)
        setTimeout(() => {
            console.log('✅ Campo actualizado:', this.campo);
            this.cargando = false;
            alert('✅ Campo actualizado correctamente.');
        }, 1000);
    }

    /**
     * Limpia el formulario
     */
    limpiarFormulario(): void {}
}
