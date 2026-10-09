import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RelacionInternaDTO } from 'app/document/document.types';
import { PropertyService, DocumentTemplateService } from 'app/configuration/configuracion.api';
import { DocumentoPlantillaFilterDTO } from 'app/configuration/domain/DocumentoPlantillaFilterDTO';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';

interface ModalData {
    relacion?: RelacionInternaDTO;
    propiedadKey: string;
}

interface CatalogoItem {
    llaveTabla: string;
    nombre: string;
    codigo: string;
}

@Component({
    selector: 'app-relation-form',
    standalone: true,
    imports: [FormsModule, MatDialogModule, MatIconModule, MatFormFieldModule, MatSelectModule, MatAutocompleteModule],
    templateUrl: './relation-form.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RelationFormComponent implements OnInit {
    private propertyService = inject(PropertyService);
    private documentTemplateService = inject(DocumentTemplateService);
    private notificationCenter = inject(NotificationCenterService);
    private destroyRef = inject(DestroyRef);
    public dialogRef = inject<MatDialogRef<RelationFormComponent>>(MatDialogRef);
    public data = inject<ModalData>(MAT_DIALOG_DATA);

    relacion: RelacionInternaDTO = new RelacionInternaDTO();

    plantillas = signal<CatalogoItem[]>([]);
    plantillasFiltradas = signal<CatalogoItem[]>([]);
    plantillaTexto = signal('');
    camposDisponibles = signal<CatalogoItem[]>([]);
    camposCargando = signal(false);
    camposError = signal(false);
    cargando = signal(false);

    private camposRequest = 0;

    ngOnInit(): void {
        if (this.data.relacion) {
            this.relacion = { ...this.data.relacion };
            this.plantillaTexto.set(this.relacion.plantillaNombre || '');
        } else {
            this.relacion = new RelacionInternaDTO();
            this.relacion.propiedad = this.data.propiedadKey;
            this.relacion.estado = 'A';
        }
        this.loadPlantillas();
        if (this.relacion.plantilla) {
            this.loadCampos(this.relacion.plantilla);
        }
    }

    private loadPlantillas(): void {
        const filter = new DocumentoPlantillaFilterDTO();
        filter.estado = 'A';
        this.documentTemplateService.getTemplates(filter).pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            next: (templates) => {
                const opciones: CatalogoItem[] = templates.map(t => ({
                    llaveTabla: t.llaveTabla,
                    nombre: t.nombre || '',
                    codigo: t.codigo || ''
                }));
                this.plantillas.set(opciones);
                const seleccionada = opciones.find(o => o.llaveTabla === this.relacion.plantilla);
                if (seleccionada) {
                    this.plantillaTexto.set(this.formatearPlantilla(seleccionada));
                }
                this.filtrarPlantillas(this.relacion.plantilla ? '' : this.plantillaTexto());
            },
            error: () => {}
        });
    }

    onPlantillaTextoChange(value: string | CatalogoItem): void {
        if (typeof value !== 'string') return;
        this.plantillaTexto.set(value);
        this.filtrarPlantillas(value);
        if (this.plantillas().length === 0 || !this.relacion.plantilla) return;
        const texto = value.trim();
        const seleccionada = this.plantillas().find(p => p.llaveTabla === this.relacion.plantilla);
        const coincide = !!seleccionada &&
            (seleccionada.nombre === texto ||
                seleccionada.codigo === texto ||
                this.formatearPlantilla(seleccionada) === texto);
        if (!coincide) {
            this.limpiarPlantilla();
        }
    }

    onPlantillaOption(event: MatAutocompleteSelectedEvent): void {
        const opcion = event.option?.value as CatalogoItem | undefined;
        if (!opcion || typeof opcion !== 'object' || !opcion.llaveTabla) return;
        this.relacion.plantilla = opcion.llaveTabla;
        this.relacion.campo = '';
        this.plantillaTexto.set(this.formatearPlantilla(opcion));
        this.filtrarPlantillas('');
        this.camposDisponibles.set([]);
        this.camposError.set(false);
        this.loadCampos(opcion.llaveTabla);
    }

    displayPlantilla = (value: unknown): string => {
        if (!value) return '';
        if (typeof value !== 'string') return this.formatearPlantilla(value as CatalogoItem);
        const encontrada = this.plantillas().find(p => p.llaveTabla === value);
        if (encontrada) return this.formatearPlantilla(encontrada);
        if (value === this.relacion.plantilla && this.relacion.plantillaNombre) return this.relacion.plantillaNombre;
        return value;
    };

    private filtrarPlantillas(texto: string): void {
        const q = (texto || '').trim().toLowerCase();
        if (!q) {
            this.plantillasFiltradas.set([]);
            return;
        }
        const todas = this.plantillas();
        this.plantillasFiltradas.set(
            todas.filter(p => p.nombre.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q)));
    }

    private limpiarPlantilla(): void {
        this.relacion.plantilla = '';
        this.relacion.campo = '';
        this.camposDisponibles.set([]);
        this.camposCargando.set(false);
        this.camposError.set(false);
        this.camposRequest++;
    }

    private loadCampos(plantillaKey: string): void {
        const request = ++this.camposRequest;
        this.camposCargando.set(true);
        this.camposError.set(false);
        this.documentTemplateService.getTemplateFields(plantillaKey).pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            next: (campos) => {
                if (request !== this.camposRequest) return;
                const opciones: CatalogoItem[] = (campos ?? []).map(c => ({
                    llaveTabla: c.llaveTabla,
                    nombre: c.nombre || '',
                    codigo: c.codigo || ''
                }));
                if (this.relacion.campo && !opciones.some(o => o.llaveTabla === this.relacion.campo)) {
                    opciones.unshift({
                        llaveTabla: this.relacion.campo,
                        nombre: this.relacion.campoNombre || this.relacion.campo,
                        codigo: ''
                    });
                }
                this.camposDisponibles.set(opciones);
                this.camposCargando.set(false);
            },
            error: (err) => {
                if (request !== this.camposRequest) return;
                this.camposDisponibles.set([]);
                this.camposCargando.set(false);
                this.camposError.set(true);
                this.notificationCenter.error(
                    'No se pudieron cargar los campos',
                    err?.error?.message || 'No fue posible consultar los campos de la plantilla'
                );
            }
        });
    }

    private formatearPlantilla(p: CatalogoItem): string {
        return p.codigo ? `${p.codigo} - ${p.nombre}` : p.nombre;
    }

    onSubmit(): void {
        if (!this.relacion.plantilla || !this.relacion.campo) return;
        this.cargando.set(true);

        const request$ = this.relacion.llaveTabla
            ? this.propertyService.updateRelation(this.relacion)
            : this.propertyService.createRelation(this.relacion);

        request$.pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            next: () => {
                this.cargando.set(false);
                this.dialogRef.close(this.relacion);
            },
            error: (err) => {
                this.cargando.set(false);
                this.notificationCenter.error(
                    'No se pudo guardar',
                    err?.error?.message || 'Ocurrió un error al guardar la relación'
                );
            }
        });
    }
}
