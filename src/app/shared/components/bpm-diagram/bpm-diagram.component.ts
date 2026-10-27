import { Component, OnInit, ChangeDetectionStrategy, inject, input, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import {  ProcesoDTO, ProcesoEstadoDTO, ProcesoGraphDTO, ProcesoTransicionDTO } from 'app/document/document.types';
import {
  ProcessService,
  TreeConfigService,
} from 'app/configuration/configuracion.api';
import { ArbolConfiguracionFilterDTO } from 'app/configuration/domain/ArbolConfiguracionFilterDTO';
import { ArbolNodoRequestDTO } from 'app/configuration/domain/ArbolNodoRequestDTO';
import { TreeNodeDTO } from 'app/configuration/domain/TreeNodeDTO';

import { DocumentTemplateFormComponent } from 'app/configuration/components/document-templates/document-template-form/document-template-form.component';
import { ProcessStateFormComponent } from 'app/configuration/components/processes/process-states/process-state-form/process-state-form.component';
import { ProcessFormComponent } from 'app/configuration/components/processes/process-form/process-form.component';
import { ProcessTransitionFormComponent } from 'app/configuration/components/processes/process-transitions/process-transition-form/process-transition-form.component';
import { WebServiceFormComponent } from 'app/configuration/components/web-services/web-service-form/web-service-form.component';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';
import { BpmCanvasComponent } from '../bpm-canvas/bpm-canvas.component';
import { BPM_CANVAS_LEGEND_ITEMS } from '../bpm-canvas/bpm-canvas.helper';
import { BPM_EDGE_COLORS, BpmCanvasEdge, BpmCanvasNode } from '../bpm-canvas/bpm-canvas.types';
import { DocumentoPlantillaTipoEnum } from 'app/document/form/form.enum';

const ESTADO_TIPO_LABELS: Record<string, string> = {
  E: 'Estado',
  D: 'Decisión',
  R: 'Iterador',
  P: 'API',
};

const ESTADO_TIPO_ICONS: Record<string, string> = {
  E: 'state',
  D: 'diamond',
  R: 'diamond',
  P: 'api',
};


const ESTADO_INICIO_LLAVE = '__inicio__';

@Component({
  selector: 'bpm-diagram',
  imports: [BpmCanvasComponent],
  templateUrl: './bpm-diagram.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./bpm-diagram.component.scss']
})
export class BpmDiagramComponent implements OnInit {
  private notification = inject(NotificationCenterService);
  private dialog = inject(MatDialog);
  readonly data = inject(MAT_DIALOG_DATA, { optional: true });
  private processService = inject(ProcessService);
  private treeConfigService = inject(TreeConfigService);
  private dialogRef = inject<MatDialogRef<BpmDiagramComponent>>(MatDialogRef);

  readonly canvasNodes = signal<BpmCanvasNode[]>([]);
  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly cargandoHijos = signal(false);
  private hijosCargados = new Set<string>();
  private procesosCargados = new Map<string, TreeNodeDTO>();
  private procesoId: string | null = null;

  readonly mode = input<'process' | 'config'>('process');

  constructor() {
    this.procesoId = this.data?.procesoId || null;
  }

  get modo(): 'process' | 'config' {
    return this.data?.mode === 'config' ? 'config' : this.mode();
  }

  readonly leyenda = BPM_CANVAS_LEGEND_ITEMS;

  ngOnInit(): void {
    if (this.modo === 'config') {
      this.loadConfigRoot();
    } else {
      this.loadProcessGraph();
    }
  }

  loadProcessGraph(): void {
    if (!this.procesoId) {
      this.isLoading.set(false);
      this.hasError.set(true);
      return;
    }
    this.isLoading.set(true);
    this.hasError.set(false);
    this.processService.getProcessForGraph(this.procesoId).subscribe({
      next: process => {
        this.canvasNodes.set(this.normalizeProcess(process));
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  loadConfigRoot(): void {
    this.isLoading.set(true);
    this.hasError.set(false);
    const filtro = new ArbolConfiguracionFilterDTO();
    filtro.profundidad = ArbolConfiguracionFilterDTO.PROFUNDIDAD_SIMPLE;
    filtro.listarPropiedades = false;
    filtro.ligero = true;
    this.treeConfigService.getTree(filtro).subscribe({
      next: raiz => {
        const ordenGrupo = (tipo?: string): number => {
          if (tipo === TreeNodeDTO.API) return 2;
          return 3;
        };
        const hijos = [...(raiz.hijos || [])].sort((a, b) => ordenGrupo(a.tipo) - ordenGrupo(b.tipo));
        const nodos: BpmCanvasNode[] = [];
        nodos.push(this.mapConfigNode(raiz, null));
        for (const hijo of hijos) {
          const nodo = this.mapConfigNode(hijo, raiz.camino);
          //if (ordenGrupo(hijo.tipo) < 3) nodo.horizontal = true;
          nodos.push(nodo);
        }
        this.canvasNodes.set(nodos);
        this.hijosCargados = new Set([raiz.camino]);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  onNodeToggle(event: { node: BpmCanvasNode; expanded: boolean }): void {
    if (this.modo !== 'config' || !event.expanded) return;
    const nodo = event.node.source as TreeNodeDTO | undefined;
    if (!nodo?.camino || !nodo.tieneHijos) return;
    if (this.hijosCargados.has(nodo.camino)) return;
    if (this.canvasNodes().some(n => n.parentId === nodo.camino)) {
      this.hijosCargados.add(nodo.camino);
      return;
    }
    if (nodo.tipo === TreeNodeDTO.PROCESO && nodo.categoria === 'E') {
      this.cargarMapaProceso(nodo);
      this.cargarIconosProceso(nodo);
      return;
    }
    this.cargandoHijos.set(true);
    const request = new ArbolNodoRequestDTO();
    request.camino = nodo.camino;
    request.tipo = nodo.tipo;
    request.llaveTabla = nodo.llaveTabla;
    request.listarPropiedades = false;
    request.ligero = true;
    this.treeConfigService.getTreeNode(request).subscribe({
      next: respuesta => {
        const hijos = (respuesta.hijos || [])
          .filter(hijo => hijo.tipo !== TreeNodeDTO.CAMPO)
          .map(hijo => {
            const hijoNodo = this.mapConfigNode(hijo, nodo.camino);
            //if (plantillaEnFila && this.esTipoPlantilla(hijo.tipo)) hijoNodo.horizontal = true;
            return hijoNodo;
          });
        const vacio = hijos.length === 0;
        if (vacio) nodo.tieneHijos = false;
        this.canvasNodes.update(nodos => {
          const base = vacio
            ? nodos.map(n => (n.id === nodo.camino ? { ...n, hasChildren: false } : n))
            : nodos;
          return [...base, ...hijos];
        });
        this.hijosCargados.add(nodo.camino);
        this.cargandoHijos.set(false);
      },
      error: err => {
        this.cargandoHijos.set(false);
        this.notification.fire({
          title: 'Error',
          html: err?.error?.message ?? 'No se pudieron cargar los hijos del nodo.',
          confirmButtonText: 'Cerrar',
        });
      },
    });
  }

  private cargarMapaProceso(nodo: TreeNodeDTO): void {
    this.cargandoHijos.set(true);
    this.processService.getProcessForGraph(nodo.llaveTabla).subscribe({
      next: proceso => {
        
        const transiciones = proceso.transiciones || [];
        const hijos = (proceso.estados || [])
          .filter(estado => !!estado.llaveTabla)
          .map(estado => this.mapEstadoNode(estado, nodo.camino));
        const aristas = this.mapTransiciones(transiciones, nodo.camino);
        const conInicio = hijos.length > 0 && transiciones.some(t => !t.estadoPartida && !!t.estadoLLegada);
        if (conInicio) hijos.unshift(this.mapEstadoInicioNode(nodo.camino));
        this.canvasNodes.update(nodos => {
          const conOtrosHijos = nodos.some(n => n.parentId === nodo.camino);
          const vacio = hijos.length === 0 && !conOtrosHijos;
          if (vacio) nodo.tieneHijos = false;
          const base = vacio
            ? nodos.map(n => (n.id === nodo.camino ? { ...n, hasChildren: false } : n))
            : nodos.map(n => (n.id === nodo.camino ? { ...n, childEdges: aristas } : n));
          return [...base, ...hijos];
        });

        this.hijosCargados.add(nodo.camino);
        this.procesosCargados.set(nodo.camino, nodo);
        this.cargandoHijos.set(false);
      },
      error: err => {
        this.cargandoHijos.set(false);
        this.notification.fire({
          title: 'Error',
          html: err?.error?.message ?? 'No se pudo cargar el mapa del proceso.',
          confirmButtonText: 'Cerrar',
        });
      },
    });
  }

  private cargarIconosProceso(nodo: TreeNodeDTO): void {
    const request = new ArbolNodoRequestDTO();
    request.camino = nodo.camino;
    request.tipo = nodo.tipo;
    request.llaveTabla = nodo.llaveTabla;
    request.listarPropiedades = false;
    request.ligero = true;
    this.treeConfigService.getTreeNode(request).subscribe({
      next: respuesta => {
        const iconos = (respuesta.hijos || [])
          .filter(hijo => hijo.tipo === TreeNodeDTO.API)
          .map(hijo => this.mapConfigNode(hijo, nodo.camino));
        if (!iconos.length) return;
        this.canvasNodes.update(nodos => {
          const existentes = new Set(nodos.map(n => n.id));
          const nuevos = iconos.filter(icono => !existentes.has(icono.id));
          if (!nuevos.length) return nodos;
          nodo.tieneHijos = true;
          return [
            ...nodos.map(n => (n.id === nodo.camino ? { ...n, hasChildren: true } : n)),
            ...nuevos,
          ];
        });
      },
      error: () => { },
    });
  }

  private estadoNodeId(camino: string, llave: string): string {
    return `${camino}/${TreeNodeDTO.ESTADO}:${llave}`;
  }

  private mapEstadoNode(estado: ProcesoEstadoDTO, camino: string): BpmCanvasNode {
    const tipo = estado.tipo || 'E';
    return {
      id: this.estadoNodeId(camino, estado.llaveTabla),
      title: estado.nombre || estado.llaveTabla,
      parentId: camino,
      metadata: [
        { label: 'Código', value: estado.codigo || (ESTADO_TIPO_LABELS[tipo] ?? tipo) },
      ],
      source: estado,
      shape: tipo === 'E' ? 'circle' : 'diamond',
      shapeFill: this.estadoShapeFill(estado),
      icon: ESTADO_TIPO_ICONS[tipo] ?? 'state',
      order: typeof estado.prioridad === 'number' ? estado.prioridad : undefined,
    };
  }

  private estadoShapeFill(estado: ProcesoEstadoDTO): string | undefined {
    if (estado.estadoDocumento === 'I') return '#ff0000';
    if (estado.estadoDocumento === 'C') return '#00ff00';
    return undefined;
  }

  private estadoInicioId(camino: string): string {
    return `${camino}/${TreeNodeDTO.ESTADO}:${ESTADO_INICIO_LLAVE}`;
  }

  private mapEstadoInicioNode(camino: string): BpmCanvasNode {
    return {
      id: this.estadoInicioId(camino),
      title: '',
      parentId: camino,
      metadata: [],
      shape: 'circle',
      shapeFill: '#000000',
      order: -1,
    };
  }

  private mapTransiciones(transiciones: ProcesoTransicionDTO[], camino: string): BpmCanvasEdge[] {
    const aristas: BpmCanvasEdge[] = [];
    const vistos = new Set<string>();
    for (const transicion of transiciones) {
      if (!transicion.estadoLLegada) continue;
      const origen = transicion.estadoPartida;
      const id =
        transicion.llaveTabla ||
        `${origen || ESTADO_INICIO_LLAVE}->${transicion.estadoLLegada}#${aristas.length}`;
      if (vistos.has(id)) continue;
      vistos.add(id);
      aristas.push({
        id,
        from: origen ? this.estadoNodeId(camino, origen) : this.estadoInicioId(camino),
        to: this.estadoNodeId(camino, transicion.estadoLLegada),
        label: transicion.nombre || undefined,
        color: BPM_EDGE_COLORS[aristas.length % BPM_EDGE_COLORS.length],
        source: transicion,
      });
    }
    return aristas;
  }

  private esTipoPlantilla(tipo?: string): boolean {
    return !!tipo && tipo.startsWith('PLANTILLA');
  }

  private puedeExpandir(nodo: TreeNodeDTO): boolean {
    if (!nodo.tieneHijos) return false;
    if (this.esTipoPlantilla(nodo.tipo)) return nodo.totalHijos !== 0;
    return true;
  }

  onEdgeActivated(edge: BpmCanvasEdge): void {
    const transicion = edge.source as ProcesoTransicionDTO | undefined;
    if (!transicion) return;
    const dialogRef = this.dialog.open(ProcessTransitionFormComponent, {
      width: '700px',
      maxWidth: '90vw',
      disableClose: true,
      data: {
        id: transicion.llaveTabla,
        processId: transicion.nodoSuperior,
      },
    });
    dialogRef.afterClosed().subscribe((result: ProcesoTransicionDTO) => {
      if (!result) return;
      this.canvasNodes.update(nodos =>
        nodos.map(n => {
          if (!n.childEdges?.some(e => e.id === edge.id)) return n;
          return {
            ...n,
            childEdges: n.childEdges.map(e =>
              e.id === edge.id ? { ...e, source: result, label: result.nombre || undefined } : e,
            ),
          };
        }),
      );
    });
  }

  private modalAccionDe(nodo: TreeNodeDTO): 'plantilla' | 'webservice' | undefined {
    if (nodo.tipo === TreeNodeDTO.API) return 'webservice';
    return undefined;
  }

  private esNodoProceso(tipo?: string): boolean {
    return tipo === TreeNodeDTO.PROCESO;
  }

  private mapConfigNode(nodo: TreeNodeDTO, parentId: string | null): BpmCanvasNode {
    return {
      id: nodo.camino,
      title: nodo.nombre || nodo.codigo || nodo.camino,
      subtitle: nodo.codigo || undefined,
      parentId,
      metadata: [],
      source: nodo,
      hasChildren: this.puedeExpandir(nodo),
      modalAction: this.modalAccionDe(nodo),
      icon: this.iconCard(nodo),
      shape: nodo.tipo === TreeNodeDTO.API ? 'icon' : undefined,
    };
  }

  private iconCard(nodo: TreeNodeDTO): string {
    if (nodo.tipo === TreeNodeDTO.API) return 'api';
    if (nodo.tipo === TreeNodeDTO.ORGANIZACION) return 'building';
    if (nodo.tipo === TreeNodeDTO.PROCESO) return 'process';
    if (nodo.tipo === TreeNodeDTO.REPORTE) return 'report';
    if (nodo.tipo === TreeNodeDTO.PLANTILLA) {
      if (nodo.categoria === DocumentoPlantillaTipoEnum.ROL) return 'person';
      if (nodo.categoria === DocumentoPlantillaTipoEnum.REPORTE) return 'report';
    }
    return 'document';
  }

  onNodeActivated(node: BpmCanvasNode): void {
    if (this.modo === 'config') {
      if (node.shape === 'circle' || node.shape === 'diamond') {
        this.abrirFormularioEstado(node);
        return;
      }
      if (node.modalAction) {
        this.onNodeModal(node);
        return;
      }
      const nodo = node.source as TreeNodeDTO | undefined;
      if (this.esNodoProceso(nodo?.tipo)) {
        this.onNodeModal(node);
        return;
      }
      if (nodo?.llaveTabla && this.esTipoPlantilla(nodo.tipo)) this.abrirPlantilla(nodo.llaveTabla);
      return;
    }
  }

  private abrirFormularioEstado(node: BpmCanvasNode): void {
    const estado = node.source as ProcesoEstadoDTO | undefined;
    if (!estado?.llaveTabla) return;
    const dialogRef = this.dialog.open(ProcessStateFormComponent, {
      width: '700px',
      maxWidth: '90vw',
      disableClose: true,
      data: { id: estado.llaveTabla, processId: estado.nodoSuperior },
    });
    dialogRef.afterClosed().subscribe((result: ProcesoEstadoDTO) => {
      if (!result || !node.parentId) return;
      const procesoCargado = this.procesosCargados.get(node.parentId);
      if (procesoCargado) this.refrescarMapaProceso(procesoCargado);
    });
  }

  private refrescarMapaProceso(nodo: TreeNodeDTO): void {
    this.canvasNodes.update(nodos => nodos.filter(n => n.parentId !== nodo.camino));
    this.hijosCargados.delete(nodo.camino);
    this.cargarMapaProceso(nodo);
  }

  onNodeModal(node: BpmCanvasNode): void {
    const nodo = node.source as TreeNodeDTO | undefined;
    if (!nodo?.llaveTabla) return;
    this.abrirModalDato(node, nodo);
  }

  private abrirPlantilla(llave: string): void {
    this.dialog.open(DocumentTemplateFormComponent, {
        data: { id: llave },
        width: '900px',
        maxWidth: '95vw',
        maxHeight: '95vh',
      });
    }

  private abrirModalDato(node: BpmCanvasNode, nodo: TreeNodeDTO): void {
    if (node.modalAction === 'plantilla') {
      this.abrirPlantilla(nodo.llaveTabla);
      return;
    }
    if (node.modalAction === 'webservice' || nodo.tipo === TreeNodeDTO.API) {
      this.dialog.open(WebServiceFormComponent, {
        disableClose: true,
        width: '700px',
        maxWidth: '90vw',
        data: { id: nodo.llaveTabla },
      });
      return;
    }

    if (nodo.tipo === TreeNodeDTO.PROCESO) {
      const dialogRef = this.dialog.open(ProcessFormComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '95vh',
      disableClose: true,
      data: { id: nodo.llaveTabla },
    });
    dialogRef.afterClosed().subscribe((result: ProcesoDTO) => {
      if (!result?.llaveTabla) return;
      this.canvasNodes.update(nodos =>
        nodos.map(n => {
          if (n.id !== node.id) return n;
          const nodo = n.source as TreeNodeDTO;
          return {
            ...n,
            title: result.nombre || n.title,
            subtitle: result.codigo || undefined,
            source: { ...nodo, nombre: result.nombre, codigo: result.codigo, estado: result.estado, dato: result },
          };
        }),
      );
    });
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  private normalizeProcess(root: ProcesoGraphDTO): BpmCanvasNode[] {
    const nodes: BpmCanvasNode[] = [];
    const visited = new Set<string>();
    const visit = (process: ProcesoGraphDTO | null | undefined, parentId: string | null): void => {

      
      if (!process?.llaveTabla || visited.has(process.llaveTabla)) return;
      visited.add(process.llaveTabla);
      const processId = process.llaveTabla;
      const metadata = [
        process.plantillas?.length ? { label: 'Plantillas', value: String(process.plantillas.length) } : null,
      ].filter((item): item is { label: string; value: string } => item !== null);
      nodes.push({
        id: processId,
        title: process.nombre || process.codigo || processId,
        subtitle: undefined,
        parentId,
        metadata,
        source: process,
      });
      for (const child of process.hijos || []) visit(child, processId);
      
    };
    visit(root, null);
    return nodes;
  }

}
