import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { PropiedadDTO } from 'app/shared/shared.domain';
import { PropertyService } from 'app/configuration/configuracion.api';
import { PropertyModalComponent } from '../property-modal/property-modal.component';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';

interface PropertyHistoryData {
    campoKey: string;
    titulo: string;
    origenCategoria?: string;
}

@Component({
    selector: 'app-property-history',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatIconModule],
    templateUrl: './property-history.component.html',
})
export class PropertyHistoryComponent implements OnInit {
    private propertyService = inject(PropertyService);
    private notificationCenter = inject(NotificationCenterService);
    private dialog = inject(MatDialog);
    public dialogRef = inject<MatDialogRef<PropertyHistoryComponent>>(MatDialogRef);
    public data = inject<PropertyHistoryData>(MAT_DIALOG_DATA);

    loading = signal(false);
    propiedades = signal<PropiedadDTO[]>([]);

    ngOnInit(): void {
        this.loadInactivas();
    }

    loadInactivas(): void {
        this.loading.set(true);
        this.propertyService.getProperties({ campo: this.data.campoKey, estado: 'I' }).subscribe({
            next: (props) => {
                this.propiedades.set([...props].sort((a, b) => this.fechaMs(b) - this.fechaMs(a)));
                this.loading.set(false);
            },
            error: () => {
                this.propiedades.set([]);
                this.loading.set(false);
            }
        });
    }

    ver(prop: PropiedadDTO): void {
        this.dialog.open(PropertyModalComponent, {
            width: '600px',
            maxWidth: '90vw',
            data: {
                propiedadId: prop.llaveTabla,
                tipoOrigen: prop.tipo,
                origenCategoria: this.data.origenCategoria || '',
                campoKey: this.data.campoKey,
                soloLectura: true
            }
        });
    }

    reactivar(prop: PropiedadDTO): void {
        this.notificationCenter.fire({
            title: '¿Reactivar propiedad?',
            text: `Se restaurará la propiedad ${prop.nombre} junto con sus relaciones.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, reactivar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (!result.isConfirmed) return;
            this.propertyService.reactivateProperty(prop).subscribe({
                next: () => {
                    this.notificationCenter.fire('Reactivada', 'Propiedad reactivada correctamente', 'success');
                    this.loadInactivas();
                },
                error: () => {
                    this.notificationCenter.fire('Error', 'No fue posible reactivar la propiedad', 'error');
                }
            });
        });
    }

    cerrar(): void {
        this.dialogRef.close();
    }

    private fechaMs(prop: PropiedadDTO): number {
        return prop.fechaEliminacion ? new Date(prop.fechaEliminacion).getTime() : 0;
    }
}
