import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { PropiedadDTO, PropiedadCampoDTO } from 'app/shared/shared.domain';
import { PropertyService } from 'app/configuration/configuracion.api';
import { PropertyModalComponent } from '../property-modal/property-modal.component';
import Swal from 'sweetalert2';

interface PropertyPanelData {
    campoKey: string;
    tipoOrigen: string;
    titulo: string;
    origenCategoria?: string;
}

@Component({
    selector: 'app-property-panel',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatIconModule],
    templateUrl: './property-panel.component.html',
})
export class PropertyPanelComponent implements OnInit {
    private propertyService = inject(PropertyService);
    private dialog = inject(MatDialog);
    public dialogRef = inject<MatDialogRef<PropertyPanelComponent>>(MatDialogRef);
    public data = inject<PropertyPanelData>(MAT_DIALOG_DATA);

    loading = signal(false);
    propiedades = signal<PropiedadDTO[]>([]);

    ngOnInit(): void {
        this.loadPropiedades();
    }

    loadPropiedades(): void {
        this.loading.set(true);
        this.propertyService.getProperties({ campo: this.data.campoKey, estado: 'A' }).subscribe({
            next: (props) => { this.propiedades.set(props); this.loading.set(false); },
            error: () => { this.propiedades.set([]); this.loading.set(false); }
        });
    }

    openModal(propiedad?: PropiedadDTO): void {
        const dialogRef = this.dialog.open(PropertyModalComponent, {
            width: '600px',
            maxWidth: '90vw',
            disableClose: true,
            data: {
                propiedad: null,
                propiedadId: propiedad?.llaveTabla,
                tipoOrigen: this.data.tipoOrigen,
                origenCategoria: this.data.origenCategoria || '',
                campoKey: this.data.campoKey
            }
        });

        dialogRef.afterClosed().subscribe((result: PropiedadCampoDTO) => {
            if (result) {
                this.loadPropiedades();
            }
        });
    }

    inactivar(prop: PropiedadDTO): void {
        Swal.fire({
            title: '¿Anular propiedad?',
            text: `Se anulará la propiedad ${prop.nombre}. Esta acción no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, anular',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.propertyService.inactivateProperty(prop).subscribe({
                    next: () => {
                        Swal.fire('Anulada', 'Propiedad anulada correctamente', 'success');
                        this.loadPropiedades();
                    },
                    error: () => {
                        Swal.fire('Error', 'No se pudo anular la propiedad', 'error');
                    }
                });
            }
        });
    }
}