import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { RelacionInternaDTO } from 'app/document/document.types';
import { PropertyService, DocumentTemplateService } from 'app/configuration/configuracion.api';
import { DocumentoPlantillaFilterDTO } from 'app/configuration/domain/DocumentoPlantillaFilterDTO';

interface ModalData {
    relacion?: RelacionInternaDTO;
    propiedadKey: string;
}

@Component({
    selector: 'app-relation-form',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule, MatFormFieldModule, MatSelectModule],
    templateUrl: './relation-form.component.html',
})
export class RelationFormComponent implements OnInit {
    private propertyService = inject(PropertyService);
    private documentTemplateService = inject(DocumentTemplateService);
    public dialogRef = inject<MatDialogRef<RelationFormComponent>>(MatDialogRef);
    public data = inject<ModalData>(MAT_DIALOG_DATA);

    relacion: RelacionInternaDTO = new RelacionInternaDTO();
    camposDisponibles: { llaveTabla: string; nombre: string }[] = [];
    plantillasDisponibles: { llaveTabla: string; nombre: string }[] = [];
    cargando = false;

    ngOnInit(): void {
        if (this.data.relacion) {
            this.relacion = { ...this.data.relacion };
        } else {
            this.relacion = new RelacionInternaDTO();
            this.relacion.propiedad = this.data.propiedadKey;
            this.relacion.estado = 'A';
        }
        this.loadCatalogs();
    }

    loadCatalogs(): void {
        this.propertyService.getProperties({ estado: 'A' }).subscribe({
            next: (props) => {
                this.camposDisponibles = props.map(p => ({ llaveTabla: p.llaveTabla, nombre: p.nombre }));
            }
        });

        const filter = new DocumentoPlantillaFilterDTO();
        filter.estado = 'A';
        this.documentTemplateService.getTemplates(filter).subscribe({
            next: (templates) => {
                this.plantillasDisponibles = templates.map(t => ({ llaveTabla: t.llaveTabla, nombre: t.nombre }));
            }
        });
    }

    onSubmit(): void {
        this.cargando = true;

        const request$ = this.relacion.llaveTabla
            ? this.propertyService.updateRelation(this.relacion)
            : this.propertyService.createRelation(this.relacion);

        request$.subscribe({
            next: () => {
                this.cargando = false;
                this.dialogRef.close(this.relacion);
            },
            error: () => {
                this.cargando = false;
            }
        });
    }
}