import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    computed,
    inject,
    signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { OrganizacionDTO } from 'app/document/document.types';
import { OrganizationService, PropertyService } from 'app/configuration/configuracion.api';
import { PropiedadCampoDTO, PropiedadDTO } from 'app/shared/shared.domain';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';
import { ImageUploaderComponent } from 'app/upload/components/image-uploader/image-uploader.component';
import { ImageFormatPipe, formatImageUrl } from 'app/shared/local-image';
import { LocalStoreService } from 'app/shared/local-store.service';
import { LayoutService } from 'app/layout/layout.service';

@Component({
    selector: 'app-organization-home-form',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatIconModule,
        ImageUploaderComponent,
        ImageFormatPipe,
    ],
    templateUrl: './organization-home-form.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationHomeFormComponent implements OnInit {
    private organizationService = inject(OrganizationService);
    private propertyService = inject(PropertyService);
    private notificationCenter = inject(NotificationCenterService);
    private layoutService = inject(LayoutService);
    private ls = inject(LocalStoreService);

    readonly dialogRef = inject<MatDialogRef<OrganizationHomeFormComponent>>(MatDialogRef);

    readonly organizacion = signal<OrganizacionDTO>(new OrganizacionDTO());
    readonly fondos = signal<PropiedadDTO[]>([]);
    readonly cargando = signal(true);
    readonly guardando = signal(false);
    readonly subiendoFondo = signal(false);
    readonly eliminando = signal<string | null>(null);

    readonly nombre = signal('');
    readonly imagen = signal<string | null>(null);
    readonly nuevoFondo = signal<string | null>(null);

    private readonly nombreOriginal = signal('');
    private readonly imagenOriginal = signal('');

    readonly hayCambios = computed(
        () =>
            this.nombre().trim() !== this.nombreOriginal() ||
            (this.imagen() ?? '') !== this.imagenOriginal()
    );

    readonly portada = computed(() => this.fondos()[0]?.valor ?? null);

    ngOnInit(): void {
        this.cargar();
    }

    private cargar(): void {
        this.cargando.set(true);
        this.organizationService.getPrincipal().subscribe({
            next: (org) => {
                this.cargando.set(false);
                if (!org?.llaveTabla) {
                    this.notificationCenter.error(
                        'Sin organización',
                        'No se encontró la organización principal para personalizar el inicio.'
                    );
                    return;
                }
                this.organizacion.set(org);
                this.nombre.set(org.nombre ?? '');
                this.imagen.set(org.imagen ? org.imagen : null);
                this.nombreOriginal.set((org.nombre ?? '').trim());
                this.imagenOriginal.set(org.imagen ?? '');
                this.cargarFondos(org.llaveTabla);
            },
            error: () => {
                this.cargando.set(false);
                this.notificationCenter.error(
                    'Error',
                    'No se pudo cargar la información de la organización.'
                );
            },
        });
    }

    private cargarFondos(campo: string): void {
        this.propertyService.getProperties({ campo, estado: 'A' }).subscribe({
            next: (propiedades) => {
                this.fondos.set(
                    (propiedades ?? []).filter(
                        (propiedad) =>
                            propiedad.key === PlantillaHelper.COVERAGE_IMAGE && !!propiedad.valor
                    )
                );
            },
            error: () => this.fondos.set([]),
        });
    }

    onFondoSeleccionado(url: string | null): void {
        this.nuevoFondo.set(url);
        if (url) {
            this.agregarFondo(url);
        }
    }

    private agregarFondo(url: string): void {
        const organizacion = this.organizacion();
        if (!organizacion.llaveTabla) {
            return;
        }

        this.subiendoFondo.set(true);
        const propiedad = new PropiedadCampoDTO();
        propiedad.tipo = 'O';
        propiedad.key = PlantillaHelper.COVERAGE_IMAGE;
        propiedad.campo = organizacion.llaveTabla;
        propiedad.valor = formatImageUrl(this.ls, url) ?? url;
        propiedad.estado = 'A';

        this.propertyService.createProperty(propiedad).subscribe({
            next: () => {
                this.subiendoFondo.set(false);
                this.nuevoFondo.set(null);
                this.cargarFondos(organizacion.llaveTabla);
                this.layoutService.getOrganization();
                this.notificationCenter.toast(
                    'Fondo agregado',
                    'La imagen ya forma parte del inicio.',
                    { icon: 'success' }
                );
            },
            error: () => {
                this.subiendoFondo.set(false);
                this.nuevoFondo.set(null);
                this.notificationCenter.error(
                    'Error',
                    'No se pudo agregar el fondo. Verifica tus permisos de administrador.'
                );
            },
        });
    }

    async eliminarFondo(fondo: PropiedadDTO): Promise<void> {
        const confirmado = await this.notificationCenter.confirm(
            'Eliminar fondo',
            '¿Deseas quitar esta imagen del inicio?'
        );
        if (!confirmado) {
            return;
        }

        const organizacion = this.organizacion();
        this.eliminando.set(fondo.llaveTabla);
        this.propertyService.inactivateProperty(fondo).subscribe({
            next: () => {
                this.eliminando.set(null);
                this.fondos.update((fondos) =>
                    fondos.filter((item) => item.llaveTabla !== fondo.llaveTabla)
                );
                this.layoutService.getOrganization();
                this.notificationCenter.toast('Fondo eliminado', undefined, {
                    icon: 'success',
                });
                if (organizacion.llaveTabla) {
                    this.cargarFondos(organizacion.llaveTabla);
                }
            },
            error: () => {
                this.eliminando.set(null);
                this.notificationCenter.error(
                    'Error',
                    'No se pudo eliminar el fondo. Verifica tus permisos de administrador.'
                );
            },
        });
    }

    guardar(): void {
        const organizacion = this.organizacion();
        const nombre = this.nombre().trim();
        if (!nombre) {
            this.notificationCenter.warn(
                'Nombre requerido',
                'El nombre de la organización no puede estar vacío.'
            );
            return;
        }

        const imagen = this.imagen()
            ? formatImageUrl(this.ls, this.imagen()!) ?? this.imagen()!
            : '';

        const payload: OrganizacionDTO = { ...organizacion, nombre, imagen };

        this.guardando.set(true);
        this.organizationService.updateOrganizacion(payload).subscribe({
            next: (result) => {
                this.guardando.set(false);
                this.organizacion.set({ ...organizacion, ...result, nombre, imagen });
                this.nombre.set(nombre);
                this.imagen.set(imagen || null);
                this.nombreOriginal.set(nombre);
                this.imagenOriginal.set(imagen);
                this.layoutService.getOrganization();
                this.notificationCenter.toast(
                    'Datos guardados',
                    'La información del inicio fue actualizada.',
                    { icon: 'success' }
                );
            },
            error: () => {
                this.guardando.set(false);
                this.notificationCenter.error(
                    'Error',
                    'No se pudieron guardar los cambios.'
                );
            },
        });
    }

    async cerrar(): Promise<void> {
        if (this.guardando()) {
            return;
        }
        if (this.hayCambios()) {
            const confirmado = await this.notificationCenter.confirm(
                'Descartar cambios',
                'Hay cambios sin guardar en el nombre o el logo. ¿Deseas salir sin guardarlos?'
            );
            if (!confirmado) {
                return;
            }
        }
        this.dialogRef.close();
    }
}
