import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ProcessService, TreeConfigService } from 'app/configuration/configuracion.api';
import { ArbolConfiguracionFilterDTO } from 'app/configuration/domain/ArbolConfiguracionFilterDTO';
import { DiferenciaDTO } from 'app/configuration/domain/DiferenciaDTO';
import { SincronizacionNodoDTO } from 'app/configuration/domain/SincronizacionNodoDTO';
import { TreeNodeDTO } from 'app/configuration/domain/TreeNodeDTO';
import { etiquetaTipoConfig } from 'app/configuration/domain/config-tipo-labels';
import { ProcesoDTO, ProcesoFilterDTO } from 'app/document/document.types';
import { BpmDiagramComponent } from 'app/shared/components/bpm-diagram/bpm-diagram.component';

interface FilaRevision {
    camino: string;
    tipo: string;
    nombre: string;
    tipoDiferencia: string;
    profundidad: number;
    camposDiferentes: string[];
    detalles: { campo: string; valorLocal: unknown; valorRemoto: unknown }[];
    nodo: TreeNodeDTO | null;
    hijosRemotos: number;
}

interface ResultadoPaso {
    accion: string;
    estado: 'aplicado' | 'omitido' | 'error' | 'pendiente';
    mensaje: string;
    creados: string[];
    logs: string;
}

interface ResumenComparacion {
    crear: number;
    actualizar: number;
    local: number;
    igual: number;
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
    private readonly processApi = inject(ProcessService);
    private readonly dialog = inject(MatDialog);
    private readonly destroyRef = inject(DestroyRef);

    paso = signal(1);

    modulos = signal<ProcesoDTO[]>([]);
    modulosSeleccionados = signal<string[]>([]);
    soloCompleto = signal(true);
    descargando = signal(false);

    remoto = signal<TreeNodeDTO | null>(null);
    archivoNombre = signal('');
    tenantOrigen = signal('');
    fechaExport = signal('');
    cargando = signal(false);

    comparando = signal(false);
    diferencias = signal<DiferenciaDTO[]>([]);
    revision = signal<FilaRevision[]>([]);
    resumen = signal<ResumenComparacion | null>(null);

    indice = signal(0);
    sincronizando = signal(false);
    resultados = signal<Record<string, ResultadoPaso>>({});
    avisoCreados = signal<string[]>([]);

    error = signal('');

    constructor() {
        const filtro = new ProcesoFilterDTO();
        filtro.estado = 'A';
        filtro.tipo = 'A';
        this.processApi.getProcesses(filtro)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: modulos => this.modulos.set((modulos || []).filter(m => !!m.codigo)),
                error: () => this.modulos.set([]),
            });
    }

    pasoActual(): number {
        return this.paso();
    }

    puedeIr(n: number): boolean {
        if (n <= 1) return true;
        if (n === 2) return true;
        if (n === 3) return !!this.remoto();
        return this.revision().length > 0;
    }

    irAPaso(n: number): void {
        if (!this.puedeIr(n)) return;
        this.error.set('');
        this.paso.set(n);
    }

    siguientePaso(): void {
        this.irAPaso(Math.min(5, this.paso() + 1));
    }

    pasoAnterior(): void {
        this.irAPaso(Math.max(1, this.paso() - 1));
    }

    explorarArbol(): void {
        this.dialog.open(BpmDiagramComponent, {
            data: { mode: 'config' },
            width: '96vw',
            maxWidth: '96vw',
            height: '90vh',
            maxHeight: '90vh',
        });
    }

    // ==================== Paso 1: Exportar ====================

    toggleModulo(codigo: string): void {
        const actual = this.modulosSeleccionados();
        this.modulosSeleccionados.set(
            actual.includes(codigo) ? actual.filter(c => c !== codigo) : [...actual, codigo]
        );
    }

    moduloSeleccionado(codigo: string): boolean {
        return this.modulosSeleccionados().includes(codigo);
    }

    exportar(): void {
        const completo = this.soloCompleto();
        const seleccion = this.modulosSeleccionados();
        if (!completo && !seleccion.length) {
            this.error.set('Seleccione al menos un módulo o exporte la configuración completa.');
            return;
        }
        this.descargando.set(true);
        this.error.set('');
        const peticion = completo ? this.api.exportTree(this.filtroBase()) : this.api.exportModules(seleccion);
        peticion
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
                    this.error.set(err?.error?.message ?? 'Ocurrió un error al exportar.');
                },
            });
    }

    // ==================== Paso 2: Cargar ====================

    leerArchivo(event: Event): void {
        const input = event.target as HTMLInputElement;
        const archivo = input.files?.[0];
        if (archivo) { this.procesarArchivo(archivo); }
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
        this.diferencias.set([]);
        this.revision.set([]);
        this.resumen.set(null);
        this.resultados.set({});
        const lector = new FileReader();
        lector.onload = () => this.interpretarJson(lector.result as string, archivo.name);
        lector.onerror = () => {
            this.cargando.set(false);
            this.error.set('No se pudo leer el archivo.');
        };
        lector.readAsText(archivo);
    }

    private interpretarJson(texto: string, nombreArchivo: string): void {
        let json: unknown;
        try {
            json = JSON.parse(texto);
        } catch {
            this.cargando.set(false);
            this.error.set('El archivo no contiene JSON válido.');
            return;
        }
        const objeto = typeof json === 'object' && json !== null ? (json as Record<string, unknown>) : null;
        if (!objeto) {
            this.cargando.set(false);
            this.error.set('El archivo no tiene el formato de un árbol o exportación de configuración.');
            return;
        }
        if (objeto['arbol']) {
            this.asignarRemoto(
                objeto['arbol'] as TreeNodeDTO,
                nombreArchivo,
                (objeto['tenantOrigen'] as string) ?? '',
                (objeto['fechaExport'] as string) ?? ''
            );
            return;
        }
        if (objeto['tipo'] && objeto['camino']) {
            this.asignarRemoto(json as TreeNodeDTO, nombreArchivo, '', '');
            return;
        }
        if (objeto['hierarchy'] || objeto['process'] || objeto['organization'] || objeto['templates']) {
            this.api.treeFromHierarchy(json)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe({
                    next: arbol => this.asignarRemoto(
                        arbol, nombreArchivo,
                        (objeto['tenantOrigen'] as string) ?? '',
                        (objeto['fechaExport'] as string) ?? ''
                    ),
                    error: err => {
                        this.cargando.set(false);
                        this.error.set(err?.error?.message ?? 'No se pudo convertir el archivo a árbol.');
                    },
                });
            return;
        }
        this.cargando.set(false);
        this.error.set('El archivo no tiene el formato de un árbol o exportación de configuración.');
    }

    private asignarRemoto(arbol: TreeNodeDTO, nombre: string, tenant: string, fecha: string): void {
        this.remoto.set(arbol);
        this.archivoNombre.set(nombre);
        this.tenantOrigen.set(tenant || '');
        this.fechaExport.set(fecha ? new Date(fecha).toLocaleString() : '');
        this.cargando.set(false);
    }

    contadorNodos(nodo: TreeNodeDTO | null): number {
        if (!nodo) { return 0; }
        let total = 1;
        for (const hijo of nodo.hijos || []) {
            total += this.contadorNodos(hijo);
        }
        return total;
    }

    // ==================== Paso 3: Comparar ====================

    comparar(): void {
        const arbol = this.remoto();
        if (!arbol) { return; }
        this.comparando.set(true);
        this.error.set('');
        this.api.compareTree(arbol, this.filtroBase())
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: difs => {
                    const filas: FilaRevision[] = [];
                    const resumen: ResumenComparacion = { crear: 0, actualizar: 0, local: 0, igual: 0 };
                    this.aplanar(difs, 0, filas, resumen);
                    this.diferencias.set(difs);
                    this.revision.set(filas);
                    this.resumen.set(resumen);
                    this.indice.set(0);
                    this.resultados.set({});
                    this.comparando.set(false);
                },
                error: err => {
                    this.comparando.set(false);
                    this.error.set(err?.error?.message ?? 'Ocurrió un error al comparar los árboles.');
                },
            });
    }

    private aplanar(difs: DiferenciaDTO[], profundidad: number, salida: FilaRevision[], resumen: ResumenComparacion): void {
        for (const dif of difs) {
            if (dif.tipoDiferencia === DiferenciaDTO.SIN_DIFERENCIA) {
                resumen.igual++;
            } else if (dif.tipoDiferencia === DiferenciaDTO.CREAR) {
                resumen.crear++;
                salida.push(this.aFila(dif, profundidad));
            } else if (dif.tipoDiferencia === DiferenciaDTO.LOCAL_SIN_REMOTO) {
                resumen.local++;
                salida.push(this.aFila(dif, profundidad));
            } else {
                resumen.actualizar++;
                salida.push(this.aFila(dif, profundidad));
            }
            if (dif.hijos?.length) {
                this.aplanar(dif.hijos, profundidad + 1, salida, resumen);
            }
        }
    }

    private aFila(dif: DiferenciaDTO, profundidad: number): FilaRevision {
        return {
            camino: dif.camino,
            tipo: dif.nodo?.tipo ?? '',
            nombre: dif.nodo?.nombre ?? '',
            tipoDiferencia: dif.tipoDiferencia,
            profundidad,
            camposDiferentes: dif.camposDiferentes ?? [],
            detalles: dif.detalles ?? [],
            nodo: dif.nodo ?? null,
            hijosRemotos: this.contadorHijosRemotos(dif),
        };
    }

    private contadorHijosRemotos(dif: DiferenciaDTO): number {
        if (!dif.hijos?.length) return 0;
        let total = 0;
        for (const hijo of dif.hijos) {
            total += 1 + this.contadorHijosRemotos(hijo);
        }
        return total;
    }

    // ==================== Paso 4: Revisar nodo a nodo ====================

    filaActual(): FilaRevision | null {
        return this.revision()[this.indice()] ?? null;
    }

    resultadoActual(): ResultadoPaso | null {
        const fila = this.filaActual();
        return fila ? this.resultados()[fila.camino] ?? null : null;
    }

    resuelta(fila: FilaRevision): boolean {
        return !!this.resultados()[fila.camino];
    }

    pendientes(): FilaRevision[] {
        return this.revision().filter(f => f.tipoDiferencia !== DiferenciaDTO.LOCAL_SIN_REMOTO && !this.resuelta(f));
    }

    totalGestionables(): number {
        return this.revision().filter(f => f.tipoDiferencia !== DiferenciaDTO.LOCAL_SIN_REMOTO).length;
    }

    resueltas(): number {
        return this.totalGestionables() - this.pendientes().length;
    }

    puedeFinalizar(): boolean {
        return this.revision().length > 0 && this.pendientes().length === 0;
    }

    esLocal(fila: FilaRevision | null): boolean {
        return fila?.tipoDiferencia === DiferenciaDTO.LOCAL_SIN_REMOTO;
    }

    aplicar(): void {
        const fila = this.filaActual();
        if (!fila || !fila.nodo || this.esLocal(fila)) { return; }
        this.sincronizando.set(true);
        this.error.set('');
        this.avisoCreados.set([]);
        const request = new SincronizacionNodoDTO();
        request.nodo = fila.nodo;
        request.camino = fila.camino;
        request.accion = fila.tipoDiferencia;
        request.incluirHijos = fila.tipoDiferencia === DiferenciaDTO.CREAR && fila.hijosRemotos > 0;
        request.crearAncestros = true;
        this.api.syncNode(request)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: resultado => {
                    const registro: ResultadoPaso = {
                        accion: fila.tipoDiferencia,
                        estado: resultado.exito ? 'aplicado' : 'error',
                        mensaje: resultado.mensaje ?? '',
                        creados: resultado.creados ?? [],
                        logs: resultado.logs ?? '',
                    };
                    this.registrar(fila.camino, registro);
                    if (registro.estado === 'aplicado' && request.incluirHijos) {
                        this.registrarDescendientes(fila.camino, fila.tipoDiferencia, registro);
                    }
                    if (registro.creados.length) this.avisoCreados.set(registro.creados);
                    this.sincronizando.set(false);
                    this.avanzarTrasAccion();
                },
                error: err => {
                    this.registrar(fila.camino, {
                        accion: fila.tipoDiferencia,
                        estado: 'error',
                        mensaje: err?.error?.message ?? 'Error al sincronizar el nodo.',
                        creados: [],
                        logs: '',
                    });
                    this.sincronizando.set(false);
                },
            });
    }

    omitir(): void {
        const fila = this.filaActual();
        if (!fila) { return; }
        this.registrar(fila.camino, {
            accion: 'OMITIR',
            estado: 'omitido',
            mensaje: 'Omitido por el usuario',
            creados: [],
            logs: '',
        });
        this.avanzarTrasAccion();
    }

    omitirRama(): void {
        const fila = this.filaActual();
        if (!fila) { return; }
        this.registrar(fila.camino, {
            accion: 'OMITIR',
            estado: 'omitido',
            mensaje: 'Rama omitida por el usuario',
            creados: [],
            logs: '',
        });
        for (const otra of this.revision()) {
            if (otra.camino !== fila.camino && otra.camino.startsWith(fila.camino + '/') && !this.resuelta(otra)) {
                this.registrar(otra.camino, {
                    accion: 'OMITIR',
                    estado: 'omitido',
                    mensaje: 'Rama omitida por el usuario',
                    creados: [],
                    logs: '',
                });
            }
        }
        this.avanzarTrasAccion();
    }

    reintentar(): void {
        const fila = this.filaActual();
        if (!fila) { return; }
        const copia = { ...this.resultados() };
        delete copia[fila.camino];
        this.resultados.set(copia);
        this.aplicar();
    }

    anteriorNodo(): void {
        this.indice.update(i => Math.max(0, i - 1));
        this.avisoCreados.set([]);
    }

    siguienteNodo(): void {
        this.indice.update(i => Math.min(this.revision().length - 1, i + 1));
        this.avisoCreados.set([]);
    }

    private avanzarTrasAccion(): void {
        const lista = this.revision();
        const actual = this.indice();
        for (let i = actual + 1; i < lista.length; i++) {
            if (!this.resuelta(lista[i])) {
                this.indice.set(i);
                this.avisoCreados.set([]);
                return;
            }
        }
        for (let i = 0; i < actual; i++) {
            if (!this.resuelta(lista[i])) {
                this.indice.set(i);
                this.avisoCreados.set([]);
                return;
            }
        }
        this.avisoCreados.set([]);
    }

    private registrar(camino: string, registro: ResultadoPaso): void {
        this.resultados.set({ ...this.resultados(), [camino]: registro });
    }

    private registrarDescendientes(camino: string, accion: string, padre: ResultadoPaso): void {
        const actualizados = { ...this.resultados() };
        for (const fila of this.revision()) {
            if (fila.camino !== camino && fila.camino.startsWith(camino + '/') && !actualizados[fila.camino]) {
                actualizados[fila.camino] = {
                    accion,
                    estado: 'aplicado',
                    mensaje: 'Creado con la rama superior',
                    creados: [],
                    logs: '',
                };
            }
        }
        this.resultados.set(actualizados);
    }

    // ==================== Paso 5: Resumen ====================

    filasResumen(): { fila: FilaRevision; resultado: ResultadoPaso | null }[] {
        return this.revision().map(fila => ({ fila, resultado: this.resultados()[fila.camino] ?? null }));
    }

    logsConsolidados(): string {
        const partes: string[] = [];
        for (const { fila, resultado } of this.filasResumen()) {
            if (!resultado) {
                partes.push(`PENDIENTE ${fila.camino}`);
                continue;
            }
            if (resultado.logs) partes.push(resultado.logs);
            else partes.push(`${resultado.estado.toUpperCase()} ${fila.camino} — ${resultado.mensaje}`);
        }
        return partes.join('\n');
    }

    contarEstado(estado: string): number {
        return Object.values(this.resultados()).filter(r => r.estado === estado).length;
    }

    reintentarErrores(): void {
        const lista = this.revision();
        const indiceError = lista.findIndex(f => this.resultados()[f.camino]?.estado === 'error');
        if (indiceError < 0) return;
        this.indice.set(indiceError);
        this.paso.set(4);
    }

    // ==================== Utilidades ====================

    etiquetaTipo(tipo: string): string {
        return etiquetaTipoConfig(tipo);
    }

    textoValor(valor: unknown): string {
        if (valor === null || valor === undefined || valor === '') return '—';
        if (typeof valor === 'object') return JSON.stringify(valor);
        return String(valor);
    }

    fechaCarga(): string {
        return this.fechaExport();
    }

    private filtroBase(): ArbolConfiguracionFilterDTO {
        const filter = new ArbolConfiguracionFilterDTO();
        filter.profundidad = ArbolConfiguracionFilterDTO.PROFUNDIDAD_COMPLETA;
        filter.listarPropiedades = false;
        return filter;
    }
}
