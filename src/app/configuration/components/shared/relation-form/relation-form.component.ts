import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, Subject, catchError, debounceTime, distinctUntilChanged, map, of, switchMap } from 'rxjs';
import { RelacionInternaDTO } from 'app/document/document.types';
import { PropertyService, DocumentTemplateService } from 'app/configuration/configuracion.api';
import { DocumentoPlantillaFilterDTO } from 'app/configuration/domain/DocumentoPlantillaFilterDTO';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';
import { RelationDialogData } from '../dialog-data';

interface CatalogoItem {
    llaveTabla: string;
    nombre: string;
    codigo: string;
}

@Component({
    selector: 'app-relation-form',
    standalone: true,
    imports: [FormsModule, MatDialogModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatAutocompleteModule],
    templateUrl: './relation-form.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RelationFormComponent implements OnInit {
    private propertyService = inject(PropertyService);
    private documentTemplateService = inject(DocumentTemplateService);
    private notificationCenter = inject(NotificationCenterService);
    private destroyRef = inject(DestroyRef);
    private cdr = inject(ChangeDetectorRef);
    public dialogRef = inject<MatDialogRef<RelationFormComponent>>(MatDialogRef);
    public data = inject<RelationDialogData>(MAT_DIALOG_DATA);

    relacion: RelacionInternaDTO = new RelacionInternaDTO();

    plantillas = signal<CatalogoItem[]>([]);
    plantillasFiltradas = signal<CatalogoItem[]>([]);
    plantillasCargando = signal(false);
    plantillasConsultadas = signal(false);
    plantillaTexto = signal('');
    camposDisponibles = signal<CatalogoItem[]>([]);
    camposCargando = signal(false);
    camposError = signal(false);
    cargando = signal(false);

    private plantillaSearch$ = new Subject<string>();
    private camposRequest = 0;

    constructor() {
        this.plantillaSearch$.pipe(
            debounceTime(250),
            distinctUntilChanged(),
            switchMap((texto) => {
                const termino = texto.trim();
                if (!termino) {
                    this.plantillas.set([]);
                    this.plantillasFiltradas.set([]);
                    this.plantillasCargando.set(false);
                    this.plantillasConsultadas.set(false);
                    return EMPTY;
                }

                this.plantillasCargando.set(true);
                this.plantillasConsultadas.set(false);

                const filter = new DocumentoPlantillaFilterDTO();
                filter.estado = 'A';
                filter.filtroParametro = termino;

                return this.documentTemplateService.getTemplates(filter).pipe(
                    map((templates) => templates.map((t) => ({
                        llaveTabla: t.llaveTabla,
                        nombre: t.nombre || '',
                        codigo: t.codigo || ''
                    }))),
                    catchError(() => of([] as CatalogoItem[]))
                );
            }),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe((opciones) => {
            this.plantillas.set(opciones);
            this.plantillasFiltradas.set(opciones);
            this.plantillasCargando.set(false);
            this.plantillasConsultadas.set(true);
            this.cdr.markForCheck();
        });
    }

    ngOnInit(): void {
        if (this.data?.id) {
            this.loadRelation(this.data.id);
            return;
        }
        this.relacion = new RelacionInternaDTO();
        this.relacion.propiedad = this.data.propiedadId;
        this.relacion.estado = 'A';
    }

    private loadRelation(id: string): void {
        this.cargando.set(true);
        this.propertyService.getRelationById(this.data.propiedadId, id).pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            next: (result) => {
                this.cargando.set(false);
                if (!result) {
                    this.notificationCenter.error('Relación no encontrada', 'No existe una relación con la clave solicitada.');
                    this.dialogRef.close();
                    return;
                }
                this.relacion = { ...result };
                this.plantillaTexto.set(this.relacion.plantillaNombre || '');
                if (this.relacion.plantilla) {
                    this.loadCampos(this.relacion.plantilla);
                }
                this.cdr.markForCheck();
            },
            error: () => {
                this.cargando.set(false);
                this.notificationCenter.error('Error', 'No se pudo cargar la relación.');
                this.dialogRef.close();
            }
        });
    }

    onPlantillaTextoChange(value: string | CatalogoItem): void {
        if (typeof value !== 'string') return;
        const teniaSeleccion = !!this.relacion.plantilla;
        const textoAnterior = this.plantillaTexto();
        this.plantillaTexto.set(value);
        this.plantillasConsultadas.set(false);
        if (teniaSeleccion && value !== textoAnterior) {
            this.limpiarPlantilla();
        }
        this.plantillaSearch$.next(value);
    }

    onPlantillaOption(event: MatAutocompleteSelectedEvent): void {
        const opcion = event.option?.value as CatalogoItem | undefined;
        if (!opcion || typeof opcion !== 'object' || !opcion.llaveTabla) return;
        this.relacion.plantilla = opcion.llaveTabla;
        this.relacion.campo = '';
        this.plantillaTexto.set(this.formatearPlantilla(opcion));
        this.plantillas.set([opcion]);
        this.plantillasFiltradas.set([opcion]);
        this.plantillasCargando.set(false);
        this.plantillasConsultadas.set(false);
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
            error: () => {
                if (request !== this.camposRequest) return;
                this.camposDisponibles.set([]);
                this.camposCargando.set(false);
                this.camposError.set(true);
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
            error: () => {
                this.cargando.set(false);
            }
        });
    }
}
