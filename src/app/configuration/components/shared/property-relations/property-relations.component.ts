import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RelacionInternaDTO, RelacionInternaFilterDTO } from 'app/document/document.types';
import { PropertyService } from 'app/configuration/configuracion.api';
import { RelationFormComponent } from '../relation-form/relation-form.component';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-property-relations',
    standalone: true,
    imports: [CommonModule, MatIconModule, MatDialogModule],
    templateUrl: './property-relations.component.html',
    styleUrl: './property-relations.component.scss'
})
export class PropertyRelationsComponent implements OnInit {
    private propertyService = inject(PropertyService);
    private dialog = inject(MatDialog);

    @Input() propiedadKey!: string;
    @Input() propiedadEstado: string = 'A';
    @Input() titulo: string = 'Relaciones de Propiedad';

    relaciones: RelacionInternaDTO[] = [];
    cargando = false;

    ngOnInit(): void {
        this.loadRelations();
    }

    loadRelations(): void {
        this.cargando = true;
        const filter = new RelacionInternaFilterDTO();
        filter.propiedad = this.propiedadKey;
        filter.estado = this.propiedadEstado;

        this.propertyService.getRelations(filter).subscribe({
            next: (rels) => {
                this.relaciones = rels;
                this.cargando = false;
            },
            error: () => {
                this.relaciones = [];
                this.cargando = false;
            }
        });
    }

    openRelationModal(relacion?: RelacionInternaDTO): void {
        const dialogRef = this.dialog.open(RelationFormComponent, {
            width: '500px',
            maxWidth: '90vw',
            disableClose: true,
            data: {
                relacion: relacion ? { ...relacion } : null,
                propiedadKey: this.propiedadKey
            }
        });

        dialogRef.afterClosed().subscribe((result: RelacionInternaDTO) => {
            if (result) {
                this.loadRelations();
            }
        });
    }

    deleteRelation(rel: RelacionInternaDTO): void {
        Swal.fire({
            title: '¿Eliminar relación?',
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.propertyService.inactivateRelation(rel).subscribe({
                    next: () => {
                        Swal.fire('Eliminado', 'Relación eliminada correctamente', 'success');
                        this.loadRelations();
                    },
                    error: () => {
                        Swal.fire('Error', 'No se pudo eliminar la relación', 'error');
                    }
                });
            }
        });
    }
}