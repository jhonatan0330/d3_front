import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TreeConfigService } from '../configuracion.api';
import {
    ArbolConfiguracionFilterDTO,
    DiferenciaDTO,
    SeleccionSincronizacionDTO,
    SincronizacionSeleccionadaDTO,
    TreeNodeDTO,
} from '../configuration.types';

interface FilaDiferencia {
    camino: string;
    tipo: string;
    nombre: string;
    tipoDiferencia: string;
    profundidad: number;
    camposDiferentes: string[];
    nodo: TreeNodeDTO;
}

@Component({
    selector: 'app-tree-compare',
    standalone: true,
    imports: [MatIconModule],
    templateUrl: './tree-compare.component.html',
    styleUrl: './tree-compare.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeCompareComponent {
    private readonly api = inject(TreeConfigService);
    private readonly destroyRef = inject(DestroyRef);

    remoto = signal<TreeNodeDTO | null>(null);
    archivoNombre = signal<string>('');
    diferencias = signal<FilaDiferencia[]>([]);
    decisiones = signal<Record<string, string>>({});
    comparando = signal(false);
    sincronizando = signal(false);
    cargando = signal(false);
    descargando = signal(false);
    logs = signal<string>('');
    logsUrl = signal<string>('');
    error = signal<string>('');

    private static readonly ETIQUETAS_TIPO: Record<string, string> = {
        ORGANIZACION: 'Organización',
        PROCESO_MACRO: 'Macroproceso',
        PROCESO: 'Proceso',
        ESTADO: 'Estado',
        TRANSICION: 'Transición',
        PLANTILLA: 'Plantilla',
        PLANTILLA_MODIFICACION: 'Plantilla Modificación',
        PLANTILLA_ANULACION: 'Plantilla Anulación',
        PLANTILLA_ACTIVACION: 'Plantilla Activación',
        CAMPO: 'Campo',
        REPORTE: 'Reporte',
        ROL: 'Rol',
        API: 'API',
        MENSAJE: 'Mensaje',
    };

    leerArchivo(event: Event): void {
        const input = event.target as HTMLInputElement;
        const archivo = input.files?.[0];
        if (!archivo) { return; }
        this.procesarArchivo(archivo);
        input.value = '';
    }

    alSoltar(event: DragEvent): void {
        event.preventDefault();
        const archivo = event.dataTransfer?.files?.[0];
        if (archivo) { this.procesarArchivo(archivo); }
    }

    alArrastrar(event: DragEvent): void {
        event.preventDefault();
    }

    private procesarArchivo(archivo: File): void {
        this.cargando.set(true);
        this.error.set('');
        this.logs.set('');
        this.logsUrl.set('');
        this.diferencias.set([]);
        this.decisiones.set({});
        const lector = new FileReader();
        lector.onload = () => {
            try {
                const arbol = JSON.parse(lector.result as string) as TreeNodeDTO;
                this.remoto.set(arbol);
                this.archivoNombre.set(archivo.name);
            } catch {
                this.error.set('El archivo no contiene un JSON válido de árbol de configuración.');
            } finally {
                this.cargando.set(false);
            }
        };
        lector.onerror = () => {
            this.cargando.set(false);
            this.error.set('No se pudo leer el archivo.');
        };
        lector.readAsText(archivo);
    }

    comparar(): void {
        const arbol = this.remoto();
        if (!arbol) { return; }
        this.comparando.set(true);
        this.error.set('');
        this.logs.set('');
        this.logsUrl.set('');
        this.api.compareTree(arbol, this.filtroBase())
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: difs => {
                    const filas: FilaDiferencia[] = [];
                    this.aplanar(difs, 0, filas);
                    this.diferencias.set(filas);
                    this.decisiones.set({});
                    this.comparando.set(false);
                },
                error: err => {
                    this.comparando.set(false);
                    this.error.set(err?.error?.message ?? 'Ocurrió un error al comparar los árboles.');
                },
            });
    }

    decidir(camino: string, accion: string): void {
        this.decisiones.set({ ...this.decisiones(), [camino]: accion });
    }

    omitirTodo(): void {
        this.decisiones.set({});
    }

    contar(accion: string): number {
        return Object.values(this.decisiones()).filter(a => a === accion).length;
    }

    tieneDecidido(): boolean {
        return Object.keys(this.decisiones()).length > 0;
    }

    seleccionPrivada(camino: string): string {
        return this.decisiones()[camino] ?? '';
    }

    selecciones(): SeleccionSincronizacionDTO[] {
        const mapa = this.decisiones();
        const lista: SeleccionSincronizacionDTO[] = [];
        for (const camino of Object.keys(mapa)) {
            const accion = mapa[camino];
            if (accion === SeleccionSincronizacionDTO.OMITIR) { continue; }
            const sel: SeleccionSincronizacionDTO = new SeleccionSincronizacionDTO();
            sel.camino = camino;
            sel.accion = accion;
            sel.incluirHijos = accion === SeleccionSincronizacionDTO.CREAR;
            lista.push(sel);
        }
        return lista;
    }

    sincronizar(): void {
        const arbol = this.remoto();
        if (!arbol) { return; }
        this.sincronizando.set(true);
        this.error.set('');
        const request: SincronizacionSeleccionadaDTO = new SincronizacionSeleccionadaDTO();
        request.arbol = arbol;
        request.selecciones = this.selecciones();
        this.api.syncTree(request)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: respuesta => {
                    this.logsUrl.set(respuesta.url);
                    this.cargarLogs(respuesta.url);
                    this.sincronizando.set(false);
                },
                error: err => {
                    this.sincronizando.set(false);
                    this.error.set(err?.error?.message ?? 'Ocurrió un error al sincronizar.');
                },
            });
    }

    exportar(): void {
        this.descargando.set(true);
        this.error.set('');
        this.api.exportTree(this.filtroBase())
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: respuesta => {
                    const enlace = document.createElement('a');
                    enlace.href = respuesta.url;
                    enlace.target = '_blank';
                    enlace.click();
                    this.descargando.set(false);
                },
                error: err => {
                    this.descargando.set(false);
                    this.error.set(err?.error?.message ?? 'Ocurrió un error al exportar el árbol.');
                },
            });
    }

    private cargarLogs(url: string): void {
        fetch(url)
            .then(r => r.text())
            .then(texto => this.logs.set(texto))
            .catch(() => this.logs.set(''));
    }

    private aplanar(difs: DiferenciaDTO[], profundidad: number, salida: FilaDiferencia[]): void {
        for (const dif of difs) {
            salida.push({
                camino: dif.camino,
                tipo: dif.nodo?.tipo ?? '',
                nombre: dif.nodo?.nombre ?? '',
                tipoDiferencia: dif.tipoDiferencia,
                profundidad,
                camposDiferentes: dif.camposDiferentes ?? [],
                nodo: dif.nodo,
            });
            if (dif.hijos?.length) {
                this.aplanar(dif.hijos, profundidad + 1, salida);
            }
        }
    }

    private filtroBase(): ArbolConfiguracionFilterDTO {
        const filter = new ArbolConfiguracionFilterDTO();
        filter.profundidad = ArbolConfiguracionFilterDTO.PROFUNDIDAD_COMPLETA;
        filter.listarPropiedades = false;
        return filter;
    }

    etiquetaTipo(tipo: string): string {
        return TreeCompareComponent.ETIQUETAS_TIPO[tipo] ?? tipo;
    }

    contadorNodos(nodo: TreeNodeDTO | null): number {
        if (!nodo) { return 0; }
        let total = 1;
        if (nodo.hijos) {
            for (const hijo of nodo.hijos) {
                total += this.contadorNodos(hijo);
            }
        }
        return total;
    }
}