import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { PropiedadDTO, PropiedadCampoDTO } from 'app/shared/shared.domain';
import { PropertyModalComponent } from '../property-modal/property-modal.component';

@Component({
    selector: 'app-property-field',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatIconModule],
    templateUrl: './property-field.component.html',
    styleUrl: './property-field.component.scss'
})
export class PropertyFieldComponent {
    private dialog = inject(MatDialog);

    @Input() propiedades: PropiedadDTO[] = [];
    @Input() tipoOrigen: string = 'C';
    @Input() origenCategoria: string = '';
    @Input() campoKey: string = '';

    @Output() propiedadesChange = new EventEmitter<PropiedadDTO[]>();

    openModal(propiedad?: PropiedadDTO): void {
        const dialogRef = this.dialog.open(PropertyModalComponent, {
            width: '600px',
            maxWidth: '90vw',
            disableClose: true,
            data: {
                propiedad: null,
                propiedadId: propiedad?.llaveTabla,
                tipoOrigen: this.tipoOrigen,
                origenCategoria: this.origenCategoria,
                campoKey: this.campoKey
            }
        });

        dialogRef.afterClosed().subscribe((result: PropiedadCampoDTO) => {
            if (result) {
                this.handleResult(result);
            }
        });
    }

    private handleResult(result: PropiedadCampoDTO): void {
        const newProp: PropiedadDTO = {
            llaveTabla: result.llaveTabla || '',
            estado: result.estado || 'A',
            propiedadValor: result.propiedadValor,
            tipo: result.tipo,
            nombre: result.nombre,
            key: result.key,
            campo: result.campo,
            valor: String(result.valor),
            texto: result.texto || '',
            motivo: result.motivo || '',
            relaciones: result.relaciones || 0,
            imagen: result.imagen || ''
        };

        if (result.llaveTabla) {
            const idx = this.propiedades.findIndex(p => p.llaveTabla === result.llaveTabla);
            if (idx >= 0) {
                this.propiedades[idx] = newProp;
            } else {
                this.propiedades.push(newProp);
            }
        } else {
            this.propiedades.push(newProp);
        }

        this.propiedadesChange.emit([...this.propiedades]);
    }

    removeProperty(prop: PropiedadDTO): void {
        if (confirm('¿Eliminar esta propiedad?')) {
            this.propiedades = this.propiedades.filter(p => p.llaveTabla !== prop.llaveTabla);
            this.propiedadesChange.emit([...this.propiedades]);
        }
    }
}