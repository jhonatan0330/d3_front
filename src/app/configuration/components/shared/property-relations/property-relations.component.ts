import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RelacionInternaDTO, RelacionInternaFilterDTO } from 'app/document/document.types';
import { PropertyService } from 'app/configuration/configuracion.api';
import { RelationFormComponent } from '../relation-form/relation-form.component';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';

@Component({
    selector: 'app-property-relations',
    standalone: true,
    imports: [DatePipe, MatIconModule, MatDialogModule],
    templateUrl: './property-relations.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyRelationsComponent {
    private notificationCenter = inject(NotificationCenterService);
    private propertyService = inject(PropertyService);
    private dialog = inject(MatDialog);
    private destroyRef = inject(DestroyRef);

    propiedadKey = input.required<string>();
    propiedadEstado = input('A');
    titulo = input('Relaciones de Propiedad');

    relaciones = signal<RelacionInternaDTO[]>([]);
    cargando = signal(true);

    constructor() {
        effect(() => {
            const key = this.propiedadKey();
            const estado = this.propiedadEstado();
            if (!key) {
                this.relaciones.set([]);
                this.cargando.set(false);
                return;
            }
            this.loadRelations(key, estado);
        });
    }

    private loadRelations(key: string, estado: string): void {
        this.cargando.set(true);
        const filter = new RelacionInternaFilterDTO();
        filter.propiedad = key;
        filter.estado = estado;

        this.propertyService.getRelations(filter).pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            next: (rels) => {
                this.relaciones.set(rels ?? []);
                this.cargando.set(false);
            },
            error: () => {
                this.relaciones.set([]);
                this.cargando.set(false);
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
                propiedadKey: this.propiedadKey()
            }
        });

        dialogRef.afterClosed().pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe((result: RelacionInternaDTO) => {
            if (result) {
                this.loadRelations(this.propiedadKey(), this.propiedadEstado());
            }
        });
    }

    deleteRelation(rel: RelacionInternaDTO): void {
        this.notificationCenter.fire({
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
                        this.notificationCenter.fire('Eliminado', 'Relación eliminada correctamente', 'success');
                        this.loadRelations(this.propiedadKey(), this.propiedadEstado());
                    },
                    error: () => {

                    }
                });
            }
        });
    }
}
