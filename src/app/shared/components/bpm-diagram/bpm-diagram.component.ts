import { Component, OnChanges, SimpleChanges, OnInit, HostListener, ChangeDetectionStrategy, inject, input, output, signal } from '@angular/core';

import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { ProcesoDTO, ProcesoEstadoDTO, ProcesoTransicionDTO } from 'app/document/document.types';
import { ProcessService, TreeConfigService } from 'app/configuration/configuracion.api';
import { ArbolConfiguracionFilterDTO } from 'app/configuration/domain/ArbolConfiguracionFilterDTO';
import { ArbolNodoRequestDTO } from 'app/configuration/domain/ArbolNodoRequestDTO';
import { TreeNodeDTO } from 'app/configuration/domain/TreeNodeDTO';
import { CONFIG_LEYENDA, etiquetaTipoConfig, iconoTipoConfig, mapTipoOrigen } from 'app/configuration/domain/config-tipo-labels';
import { PropertyPanelComponent } from 'app/configuration/components/shared/property-panel/property-panel.component';
import { DocumentTemplateFormComponent } from 'app/configuration/components/document-templates/document-template-form/document-template-form.component';
import { ProcessStateFormComponent } from 'app/configuration/components/processes/process-states/process-state-form/process-state-form.component';
import { WebServiceFormComponent } from 'app/configuration/components/web-services/web-service-form/web-service-form.component';
import { MessageDetailComponent } from 'app/configuration/components/messages/message-detail/message-detail.component';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';
import { BpmLeafDiagramComponent } from '../bpm-leaf-diagram/bpm-leaf-diagram.component';
import { BpmCanvasComponent } from '../bpm-canvas/bpm-canvas.component';
import { BPM_EDGE_COLORS, BpmCanvasEdge, BpmCanvasLegendItem, BpmCanvasNode } from '../bpm-canvas/bpm-canvas.types';

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

const ESTADO_DOC_INACTIVO = 'I';
const ESTADO_DOC_FINALIZADO = 'C';
const ESTADO_INICIO_LLAVE = '__inicio__';

export interface Proceso {
  id: string;
  nombre?: string;
  roles?: number;
  plantillas?: number;
  apis?: number;
  reportes?: number;
  imagen?: string;
  children?: Proceso[];
}

interface NodeRender {
  proceso: Proceso;
  x: number;
  y: number;
  r: number;
  depth: number;
  w: number;
  h: number;
}

@Component({
    selector: 'bpm-diagram',
    imports: [BpmCanvasComponent],
    templateUrl: './bpm-diagram.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./bpm-diagram.component.scss']
})
export class BpmDiagramComponent implements OnChanges, OnInit {
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

  readonly proceso = input<Proceso | null>(null);
  readonly mode = input<'process' | 'config'>('process');
  readonly width = input(600);
  readonly height = input(400);
  readonly nodeRadius = input(48);

  constructor() {
    this.procesoId = this.data?.procesoId || null;
  }

  get modo(): 'process' | 'config' {
    return this.data?.mode === 'config' ? 'config' : this.mode();
  }

  get leyenda(): BpmCanvasLegendItem[] {
    return this.modo === 'config' ? CONFIG_LEYENDA.map(item => ({ ...item })) : [];
  }

  // Tracks expanded nodes by id
  expanded = new Set<string>();

  // Pan/zoom state
  panX = 0;
  panY = 0;
  scale = 1;
  private dragging = false;
  private lastDragX = 0;
  private lastDragY = 0;
  // Node dragging
  private draggingNode: NodeRender | null = null;
  private nodeDragOffsetX = 0;
  private nodeDragOffsetY = 0;

  // Manual position overrides for nodes (id -> {x,y})
  positionOverrides: { [id: string]: { x: number; y: number } } = {};

  // Events to let parent components respond to clicks/context menus
  readonly nodeSelected = output<Proceso>();
  readonly nodeContext = output<{
    proceso: Proceso;
    event: MouseEvent;
}>();

  nodes: NodeRender[] = [];
  links: { x1: number; y1: number; x2: number; y2: number }[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    this.render();
  }

  ngOnInit(): void {
    this.render();
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
    this.treeConfigService.getTree(filtro).subscribe({
      next: raiz => {
        const ordenGrupo = (tipo?: string): number => {
          if (tipo === TreeNodeDTO.ROL) return 0;
          if (tipo === TreeNodeDTO.MENSAJE) return 1;
          if (tipo === TreeNodeDTO.API) return 2;
          return 3;
        };
        const hijos = [...(raiz.hijos || [])].sort((a, b) => ordenGrupo(a.tipo) - ordenGrupo(b.tipo));
        const nodos: BpmCanvasNode[] = [];
        nodos.push(this.mapConfigNode(raiz, null));
        for (const hijo of hijos) {
          const nodo = this.mapConfigNode(hijo, raiz.camino);
          if (ordenGrupo(hijo.tipo) < 3) nodo.horizontal = true;
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
    if (nodo.tipo === TreeNodeDTO.PROCESO) {
      this.cargarMapaProceso(nodo);
      return;
    }
    this.cargandoHijos.set(true);
    const request = new ArbolNodoRequestDTO();
    request.camino = nodo.camino;
    request.tipo = nodo.tipo;
    request.llaveTabla = nodo.llaveTabla;
    request.listarPropiedades = false;
    this.treeConfigService.getTreeNode(request).subscribe({
      next: respuesta => {
        const plantillaEnFila = this.esTipoPlantilla(nodo.tipo) || nodo.tipo === TreeNodeDTO.PROCESO_MACRO;
        const hijos = (respuesta.hijos || [])
          .filter(hijo => hijo.tipo !== TreeNodeDTO.CAMPO)
          .map(hijo => {
            const hijoNodo = this.mapConfigNode(hijo, nodo.camino);
            if (plantillaEnFila && this.esTipoPlantilla(hijo.tipo)) hijoNodo.horizontal = true;
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
        const vacio = hijos.length === 0;
        if (vacio) nodo.tieneHijos = false;
        this.canvasNodes.update(nodos => {
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
    };
  }

  private estadoShapeFill(estado: ProcesoEstadoDTO): string | undefined {
    if (estado.estadoDocumento === ESTADO_DOC_INACTIVO) return '#ff0000';
    if (estado.estadoDocumento === ESTADO_DOC_FINALIZADO) return '#00ff00';
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
    };
  }

  private mapTransiciones(transiciones: ProcesoTransicionDTO[], camino: string): BpmCanvasEdge[] {
    const aristas: BpmCanvasEdge[] = [];
    const vistos = new Set<string>();
    for (const transicion of transiciones) {
      if (!transicion.estadoLLegada) continue;
      const origen = transicion.estadoPartida;
      const id = transicion.llaveTabla || `${origen || ESTADO_INICIO_LLAVE}->${transicion.estadoLLegada}`;
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

  private abrirPlantilla(llave: string): void {
    this.dialog.open(DocumentTemplateFormComponent, {
      data: { template: llave },
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '95vh',
    });
  }

  onEdgeActivated(edge: BpmCanvasEdge): void {
    const transicion = edge.source as ProcesoTransicionDTO | undefined;
    if (!transicion?.plantilla) return;
    this.abrirPlantilla(transicion.plantilla);
  }

  private tipoOrigenFuente(source: TreeNodeDTO | ProcesoEstadoDTO): string | null {
    if ('camino' in source) return mapTipoOrigen(source.tipo ?? '');
    if ('avance' in source || 'proceso' in source) return 'A';
    return null;
  }

  private modalAccionDe(nodo: TreeNodeDTO): 'plantilla' | 'webservice' | 'mensaje' | undefined {
    const dato = nodo.dato;
    if (nodo.tipo === TreeNodeDTO.ROL) return dato?.plantilla ? 'plantilla' : undefined;
    if (nodo.tipo === TreeNodeDTO.API) return dato ? 'webservice' : undefined;
    if (nodo.tipo === TreeNodeDTO.MENSAJE) return dato ? 'mensaje' : undefined;
    return undefined;
  }

  private esTipoIcono(tipo?: string): boolean {
    return tipo === TreeNodeDTO.ROL || tipo === TreeNodeDTO.MENSAJE || tipo === TreeNodeDTO.API;
  }

  private mapConfigNode(nodo: TreeNodeDTO, parentId: string | null): BpmCanvasNode {
    const icono = this.esTipoIcono(nodo.tipo);
    const metadata = [
      !icono && nodo.tipo ? { label: 'Tipo', value: etiquetaTipoConfig(nodo.tipo) } : null,
      nodo.codigo ? { label: 'Código', value: nodo.codigo } : null,
    ].filter((item): item is { label: string; value: string } => item !== null);
    return {
      id: nodo.camino,
      title: nodo.nombre || nodo.codigo || nodo.camino,
      subtitle: nodo.codigo || undefined,
      parentId,
      metadata,
      source: nodo,
      hasChildren: this.puedeExpandir(nodo),
      hasProperties: !!mapTipoOrigen(nodo.tipo) && !!nodo.llaveTabla,
      modalAction: this.modalAccionDe(nodo),
      icon: iconoTipoConfig(nodo.tipo) ?? undefined,
      shape: icono ? 'icon' : undefined,
    };
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
      if (nodo?.llaveTabla && this.esTipoPlantilla(nodo.tipo)) this.abrirPlantilla(nodo.llaveTabla);
      return;
    }
    const process = node.source as ProcesoDTO | undefined;
    if (!process || (process.hijos || []).length > 0) return;
    this.dialog.open(BpmLeafDiagramComponent, {
      data: { procesoId: process.llaveTabla },
      width: '920px',
      maxWidth: '98vw',
    });
  }

  private abrirFormularioEstado(node: BpmCanvasNode): void {
    const estado = node.source as ProcesoEstadoDTO | undefined;
    if (!estado?.llaveTabla) return;
    const proceso = { llaveTabla: estado.proceso, nombre: estado.procesoNombre } as ProcesoDTO;
    const dialogRef = this.dialog.open(ProcessStateFormComponent, {
      width: '700px',
      maxWidth: '90vw',
      disableClose: true,
      data: { state: { ...estado }, process: proceso },
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

  onNodeProperties(node: BpmCanvasNode): void {
    if (this.modo !== 'config') return;
    const source = node.source as TreeNodeDTO | ProcesoEstadoDTO | undefined;
    if (!source?.llaveTabla) return;
    const tipoOrigen = this.tipoOrigenFuente(source);
    if (!tipoOrigen) return;
    this.dialog.open(PropertyPanelComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: true,
      data: { campoKey: source.llaveTabla, tipoOrigen, titulo: source.nombre },
    });
  }

  onNodeModal(node: BpmCanvasNode): void {
    const nodo = node.source as TreeNodeDTO | undefined;
    if (!nodo?.dato) return;
    if (node.modalAction === 'plantilla') {
      const plantilla = nodo.dato.plantilla as string | undefined;
      if (plantilla) this.abrirPlantilla(plantilla);
    } else if (node.modalAction === 'webservice') {
      this.dialog.open(WebServiceFormComponent, {
        disableClose: true,
        width: '700px',
        maxWidth: '90vw',
        data: { ...nodo.dato },
      });
    } else if (node.modalAction === 'mensaje') {
      const dato = nodo.dato;
      this.dialog.open(MessageDetailComponent, {
        width: '800px',
        maxWidth: '90vw',
        maxHeight: '90vh',
        disableClose: true,
        data: { ...dato, titulo: dato.titulo || dato.nombre },
      });
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  private normalizeProcess(root: ProcesoDTO): BpmCanvasNode[] {
    const nodes: BpmCanvasNode[] = [];
    const visited = new Set<string>();
    const visit = (process: ProcesoDTO | null | undefined, parentId: string | null): void => {
      if (!process?.llaveTabla || visited.has(process.llaveTabla)) return;
      visited.add(process.llaveTabla);
      const processId = process.llaveTabla;
      const metadata = [
        process.tipo ? { label: 'Tipo', value: process.tipo } : null,
        process.codigo ? { label: 'Código', value: process.codigo } : null,
        process.plantillas?.length ? { label: 'Plantillas', value: String(process.plantillas.length) } : null,
      ].filter((item): item is { label: string; value: string } => item !== null);
      nodes.push({
        id: processId,
        title: process.nombre || process.codigo || processId,
        subtitle: process.objetivo || undefined,
        parentId,
        metadata,
        source: process,
      });
      for (const child of process.hijos || []) visit(child, processId);
    };
    visit(root, null);
    return nodes;
  }

  toggle(node: Proceso) {
    if (!node || !node.id) return;
    if (this.expanded.has(node.id)) this.expanded.delete(node.id);
    else this.expanded.add(node.id);
    this.render();
  }

  onNodeClick(p: Proceso, ev?: MouseEvent) {
    if (ev) ev.stopPropagation();
    // if node has no children, open leaf diagram popup to show states/transitions
    if (!p.children || p.children.length === 0) {
      try {
        this.dialog.open(BpmLeafDiagramComponent, { data: { procesoId: p.id, server: (p as any).server || null }, width: '880px', maxWidth: '98vw' });
        return;
      } catch (e) {
        // continue to emit selection if dialog fails
      }
    }
    this.nodeSelected.emit(p);
  }

  onNodeContext(p: Proceso, ev: MouseEvent) {
    ev.preventDefault();
    ev.stopPropagation();
    this.nodeContext.emit({ proceso: p, event: ev });
  }

  // basic tooltip builder from proceso properties
  buildTooltip(p: Proceso) {
    if (!p) return '';
    const parts: string[] = [];
    if (p.nombre) parts.push(p.nombre);
    // try to include a few known properties if present
    const anyP: any = p as any;
    if (anyP.plantillaNombre) parts.push('Plantilla: ' + anyP.plantillaNombre);
    if (anyP.estadoDocumento) parts.push('Estado: ' + anyP.estadoDocumento);
    if (anyP.propiedades && Array.isArray(anyP.propiedades)) {
      parts.push('Propiedades: ' + anyP.propiedades.map((x: any) => x.nombre || x).join(', '));
    }
    return parts.join(' | ');
  }

  // mouse handlers for pan/zoom
  startDrag(ev: MouseEvent) {
    // Start panning (unless a node started dragging and stopped propagation)
    this.dragging = true;
    this.lastDragX = ev.clientX;
    this.lastDragY = ev.clientY;
  }

  endDrag() {
    this.dragging = false;
  }

  doDrag(ev: MouseEvent) {
    if (this.draggingNode) {
      // node dragging handled by document mouse listeners
      return;
    }
    if (!this.dragging) return;
    const dx = ev.clientX - this.lastDragX;
    const dy = ev.clientY - this.lastDragY;
    this.panX += dx / this.scale;
    this.panY += dy / this.scale;
    this.lastDragX = ev.clientX;
    this.lastDragY = ev.clientY;
  }

  @HostListener('wheel', ['$event'])
  onWheel(ev: WheelEvent) {
    // zoom centered on cursor
    ev.preventDefault();
    const delta = ev.deltaY > 0 ? 0.9 : 1.1;
    const oldScale = this.scale;
    this.scale = Math.max(0.2, Math.min(3, this.scale * delta));
    // adjust pan so zoom is centered roughly where mouse is
    const rect = (ev.target as Element).getBoundingClientRect();
    const mx = ev.clientX - rect.left;
    const my = ev.clientY - rect.top;
    this.panX = (this.panX - mx / oldScale) * (this.scale / oldScale) + mx / this.scale;
    this.panY = (this.panY - my / oldScale) * (this.scale / oldScale) + my / this.scale;
  }

  // Node drag lifecycle
  startNodeDrag(n: NodeRender, ev: MouseEvent) {
    ev.stopPropagation();
    ev.preventDefault();
    this.draggingNode = n;
    const rect = (ev.target as Element).closest('svg')?.getBoundingClientRect();
    if (!rect) return;
    const svgX = (ev.clientX - rect.left) / this.scale - this.panX;
    const svgY = (ev.clientY - rect.top) / this.scale - this.panY;
    this.nodeDragOffsetX = n.x - svgX;
    this.nodeDragOffsetY = n.y - svgY;
    // ensure there is an override entry
    this.positionOverrides[n.proceso.id] = { x: n.x, y: n.y };
  }

  @HostListener('document:mousemove', ['$event'])
  onDocumentMouseMove(ev: MouseEvent) {
    if (!this.draggingNode) return;
    const svgEl = document.querySelector('svg');
    if (!svgEl) return;
    const rect = svgEl.getBoundingClientRect();
    const svgX = (ev.clientX - rect.left) / this.scale - this.panX;
    const svgY = (ev.clientY - rect.top) / this.scale - this.panY;
    const id = this.draggingNode.proceso.id;
    this.positionOverrides[id] = { x: svgX + this.nodeDragOffsetX, y: svgY + this.nodeDragOffsetY };
    // update nodes/links view
    this.render();
  }

  @HostListener('document:mouseup', ['$event'])
  onDocumentMouseUp(ev: MouseEvent) {
    if (this.draggingNode) {
      this.draggingNode = null;
    }
    this.dragging = false;
  }

  private render() {
    this.nodes = [];
    this.links = [];
    const proceso = this.proceso();
    if (!proceso) return;

    const cx = this.width() / 2;
    const cy = this.height() / 2;
    const rootR = this.nodeRadius();
    this.placeNode(proceso, cx, cy, rootR, 0);

    // ensure parents render before children by sorting by depth (parents: small depth)
    this.nodes.sort((a, b) => (a.depth || 0) - (b.depth || 0));
  }

  // placeNode now returns the bounding box of the subtree so parents can expand to contain children
  private placeNode(p: Proceso, cx: number, cy: number, r: number, depth = 0): { minX: number; maxX: number; minY: number; maxY: number } {
    // By default, node radius is the provided r
    let parentR = r;

    // If there is a manual override for this proceso, use it for position
    if (p && p.id && this.positionOverrides[p.id]) {
      const o = this.positionOverrides[p.id];
      cx = o.x;
      cy = o.y;
    }

    // If node has no children, just draw it and return its bbox
    if (!p.children || p.children.length === 0) {
      const dims = this.nodeDims(parentR, p);
      this.nodes.push({ proceso: p, x: cx, y: cy, r: parentR, depth, w: dims.w, h: dims.h });
      return { minX: cx - dims.w / 2, maxX: cx + dims.w / 2, minY: cy - dims.h / 2, maxY: cy + dims.h / 2 };
    }

    // If not expanded, draw collapsed node and don't render children
    if (!this.expanded.has(p.id)) {
      const dims = this.nodeDims(parentR, p);
      this.nodes.push({ proceso: p, x: cx, y: cy, r: parentR, depth, w: dims.w, h: dims.h });
      return { minX: cx - dims.w / 2, maxX: cx + dims.w / 2, minY: cy - dims.h / 2, maxY: cy + dims.h / 2 };
    }

    // When expanded, compute child radius (based on parent r) and required placement
    const count = p.children.length;
    const minChildR = 20;
    const childR = Math.max(minChildR, r * 0.6);

    // Spacing/padding values
    const spacing = 8; // minimum gap between child boxes
    const innerPadding = 8; // padding between child outer edge and parent inner edge
    // First, compute subtree sizes for each child (respecting their expanded state)
    const childSizes: Array<{ width: number; height: number }> = [];
    for (let i = 0; i < count; i++) {
      const child = p.children[i];
      const size = this.computeSubtreeSize(child, childR);
      childSizes.push(size);
    }

    // total width required by children placed horizontally
    const totalChildrenWidth = childSizes.reduce((s, c) => s + c.width, 0) + Math.max(0, count - 1) * spacing;

    // leftmost child center x
    let cursorX = cx - totalChildrenWidth / 2;

    const extraHorizontalSpacing = 24; // extra horizontal gap for expanded children
    const childrenBBoxes: Array<{ minX: number; maxX: number; minY: number; maxY: number }> = [];
    for (let i = 0; i < count; i++) {
      const cs = childSizes[i];
      const child = p.children[i];

      // if the child is expanded, give it extra horizontal space so it doesn't collide with neighbors
      const extra = this.expanded.has(child.id) ? extraHorizontalSpacing : 0;
      const effWidth = cs.width + extra;
      const childCenterX = cursorX + effWidth / 2;
      const childCenterY = cy; // keep same vertical level

      // link from parent center to child center
      this.links.push({ x1: cx, y1: cy, x2: childCenterX, y2: childCenterY });

      // Recurse for child; pass childR as its base radius and depth+1
      const childBox = this.placeNode(child, childCenterX, childCenterY, childR, depth + 1);
      childrenBBoxes.push(childBox);

      cursorX += effWidth + spacing;
    }

    // compute extents of children
    let minX = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    for (const b of childrenBBoxes) {
      minX = Math.min(minX, b.minX);
      maxX = Math.max(maxX, b.maxX);
      minY = Math.min(minY, b.minY);
      maxY = Math.max(maxY, b.maxY);
    }

    // Parent must be large enough to contain children horizontally
    const neededParentR = Math.max(r, (maxX - minX) / 2 + innerPadding);
    parentR = Math.max(r, neededParentR);

    // compute dims for parent based on updated parentR and label
    const dims = this.nodeDims(parentR, p);
    this.nodes.push({ proceso: p, x: cx, y: cy, r: parentR, depth, w: dims.w, h: dims.h });

    // overall bbox includes parent and children
    const overallMinX = Math.min(cx - dims.w / 2, minX);
    const overallMaxX = Math.max(cx + dims.w / 2, maxX);
    const overallMinY = Math.min(cy - dims.h / 2, minY);
    const overallMaxY = Math.max(cy + dims.h / 2, maxY);

    return { minX: overallMinX, maxX: overallMaxX, minY: overallMinY, maxY: overallMaxY };
  }

  // Compute required subtree size (width/height) for layout, without mutating nodes/links
  private computeSubtreeSize(p: Proceso, r: number): { width: number; height: number } {
    const minChildR = 20;
    const childR = Math.max(minChildR, r * 0.6);
    const spacing = 8;

    if (!p.children || p.children.length === 0) {
      const dims = this.nodeDims(r, p);
      return { width: dims.w, height: dims.h };
    }

    if (!this.expanded.has(p.id)) {
      const dims = this.nodeDims(r, p);
      return { width: dims.w, height: dims.h };
    }

    // sum child widths recursively
    let totalW = 0;
    let maxH = 0;
    for (const child of p.children) {
      const sz = this.computeSubtreeSize(child, childR);
      totalW += sz.width;
      maxH = Math.max(maxH, sz.height);
    }
    totalW += Math.max(0, p.children.length - 1) * spacing;

    const dims = this.nodeDims(r, p);
    return { width: Math.max(dims.w, totalW), height: Math.max(dims.h, maxH) };
  }

  // Compute node rectangle dimensions based on label length and base r
  private nodeDims(r: number, p: Proceso): { w: number; h: number } {
    const text = (p && (p.nombre || p.id)) ? (p.nombre || p.id) : '';
    const charWidth = 7; // approximate average char width at font-size 12
    const paddingX = 18; // left+right padding
    const paddingY = 12; // top+bottom padding
    const labelW = Math.max(0, text.length * charWidth + paddingX);
    const baseW = r * 2;
    const w = Math.max(baseW, labelW);
    const baseH = Math.max(24, r * 2);
    // include header height only when expanded (header strip shown at top)
    let h = baseH + paddingY + (this.expanded.has(p.id) ? this.headerHeight : 0);
    // if node is expanded and has badges, reserve footer height for badges (stacked vertically)
    const badgesCount = (this.expanded.has(p.id) ? this.getBadges(p).length : 0) || 0;
    if (badgesCount > 0) {
      const footer = badgesCount * (this.badgeHeight + this.badgePadding);
      h += footer + 8; // small extra gap
    }
    return { w, h };
  }

  // Header and badge sizing
  headerHeight = 28;
  avatarSize = 20;
  badgeHeight = 16;
  badgePadding = 6;

  // Return badges data based on proceso fields (roles, reports, plantillas, apis)
  getBadges(p: any): Array<{ key: string; label: string; count: number; w: number }> {
    if (!p) return [];
    const keys = ['roles', 'reports', 'plantillas', 'apis'];
    const out: Array<{ key: string; label: string; count: number; w: number }> = [];
    const charWidth = 7;
    const minW = 48;
    for (const k of keys) {
      const v = p[k];
      if (v == null) continue;
      let count = 0;
      if (Array.isArray(v)) count = v.length;
      else if (typeof v === 'number') count = v;
      else if (typeof v === 'object') count = Object.keys(v).length;
      else if (typeof v === 'string') count = v ? 1 : 0;
      if (count > 0) {
        const label = k;
        // compute width based on label + number
        const labelW = (label.length * charWidth) + 12; // text padding
        const numW = (String(count).length * charWidth) + 10;
        const w = Math.max(minW, this.badgePadding * 2 + labelW + numW);
        out.push({ key: k, label, count, w });
      }
    }
    return out;
  }

  // Called when a badge button is clicked; opens a popup showing the list or details
  onBadgeClick(p: Proceso, b: { key: string; label: string; count: number }, ev?: MouseEvent) {
    if (ev) ev.stopPropagation();
    const key = b.key;
    const items: any = (p as any)[key];
    let html = '';
    if (!items) {
      html = '<div>No hay elementos</div>';
    } else if (Array.isArray(items)) {
      html = '<ul style="text-align:left">' + items.map((it: any) => '<li>' + (it && (it.nombre || it.name || JSON.stringify(it)) || JSON.stringify(it)) + '</li>').join('') + '</ul>';
    } else if (typeof items === 'object') {
      // show object keys/values
      html = '<pre style="text-align:left">' + JSON.stringify(items, null, 2) + '</pre>';
    } else {
      html = '<div>' + String(items) + '</div>';
    }

    this.notification.fire({ title: b.label + ' (' + b.count + ')', html, confirmButtonText: 'Cerrar' });
  }

  // Helper to get an icon URL for a proceso (try several common property names)
  getIconUrl(p: any): string | null {
    if (!p) return null;
    return p.icon || p.imagen || p.image || p.logo || null;
  }

  // helper to show plus icon only when node has children
  hasChildren(p: Proceso) {
    return p && p.children && p.children.length > 0;
  }

  // helper used by template to read a node's type safely
  nodeType(n: NodeRender) {
    const anyP: any = n && n.proceso ? n.proceso : null;
    return anyP && anyP.type ? anyP.type : null;
  }
}
