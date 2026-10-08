import { ChangeDetectionStrategy, Component, computed, effect, ElementRef, input, output, signal, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import {
    BPM_EDGE_COLORS,
    BpmCanvasAction,
    BpmCanvasEdge,
    BpmCanvasLegendItem,
    BpmCanvasMode,
    BpmCanvasNode,
    BpmCanvasScene,
    BpmCanvasSceneEdge,
    BpmCanvasSceneNode,
} from './bpm-canvas.types';

const CARD_WIDTH = 250;
const CARD_GAP_X = 112;
const CARD_GAP_Y = 28;
const CANVAS_PADDING = 56;
const TREE_PAD = 10;
const TREE_PAD_H = 16;
const PAN_ENGAGE_PX = 4;
const SHAPE_TOP = 2;
const SHAPE_R = 10;
const SHAPE_HALF_W = 12;
const SHAPE_SLOT = 50;
const SHAPE_HEIGHT = SHAPE_TOP + SHAPE_R * 2 + 42;
const ICON_SLOT = 90;
const ICON_TOP = 4;
const ICON_SIZE = 30;
const ICON_TITLE_Y = 50;
const ICON_META_Y = 67;
const ICON_HEIGHT = 74;
const SELF_LOOP_SPREAD = 56;
const SELF_LOOP_DROP = 60;
const SELF_LOOP_STRIDE = 30;

const ICON_PATHS: Record<string, string> = {
    building: 'M4 2h16v20H4zM10 16h4v6h-4zM7 5h3v3H7zM14 5h3v3h-3zM7 11h3v3H7zM14 11h3v3h-3z',
    folder: 'M2 4h7l2 3h11v13H2z',
    process: 'M4 4h16v16H4zM9 9l6 3-6 3z',
    state: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 6a4 4 0 1 1 0 8 4 4 0 0 1 0-8z',
    transition: 'M2 10h13V6l7 6-7 6v-4H2z',
    document: 'M5 2h9l5 5v15H5zM8 11h9v1.6H8zM8 15h9v1.6H8z',
    field: 'M3 6h18v12H3zM5 8h14v8H5z',
    report: 'M4 20V10h4v10zM10 20V4h4v16zM16 20v-7h4v7z',
    person: 'M12 3a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zM3 21c0-5 4-8.5 9-8.5s9 3.5 9 8.5z',
    api: 'M8 6 2 12l6 6 1.6-1.6L5.2 12 9.6 7.6zM16 6l6 6-6 6-1.6-1.6L18.8 12l-4.4-4.4zM13.8 5l-4 14h2.4l4-14z',
    message: 'M2 4h20v13H9l-7 4.5z',
    diamond: 'M12 2 22 12 12 22 2 12zM12 6.5 17.5 12 12 17.5 6.5 12z',
};

interface TreeFlowLayout {
    colOf: Map<string, number>;
    colX: Map<number, number>;
    rowOf: Map<string, number>;
    blockW: number;
    blockH: number;
    returnCount: number;
    aboveCount: number;
    selfLoopCount: number;
    iconKids: BpmCanvasNode[];
    iconBlockW: number;
    iconBlockH: number;
}

let canvasSequence = 0;

@Component({
    selector: 'bpm-canvas',
    standalone: true,
    imports: [NgTemplateOutlet],
    templateUrl: './bpm-canvas.component.html',
    styleUrls: ['./bpm-canvas.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BpmCanvasComponent {
    readonly mode = input<BpmCanvasMode>('flow');
    readonly nodes = input<BpmCanvasNode[]>([]);
    readonly edges = input<BpmCanvasEdge[]>([]);
    readonly legend = input<BpmCanvasLegendItem[]>([]);
    readonly nodeActivated = output<BpmCanvasNode>();
    readonly actionActivated = output<BpmCanvasAction>();
    readonly nodeToggle = output<{ node: BpmCanvasNode; expanded: boolean }>();
    readonly nodeProperties = output<BpmCanvasNode>();
    readonly nodeModal = output<BpmCanvasNode>();
    readonly edgeActivated = output<BpmCanvasEdge>();

    readonly expandedNodeIds = signal<Set<string> | null>(null);
    readonly selectedNodeId = signal<string | null>(null);
    readonly scale = signal(1);
    readonly panX = signal(0);
    readonly panY = signal(0);
    readonly isPanning = signal(false);
    readonly markerId = `bpm-canvas-arrow-${++canvasSequence}`;
    readonly coloresArista = BPM_EDGE_COLORS;
    readonly scene = computed(() => this.buildScene(
        this.mode(),
        this.nodes(),
        this.edges(),
        this.expandedNodeIds(),
    ));

    private readonly viewport = viewChild<ElementRef<HTMLDivElement>>('viewport');
    private pendingCenterId: string | null = null;
    private pendingCenterNodes: BpmCanvasNode[] | null = null;

    private readonly centerOnExpand = effect(() => {
        const scene = this.scene();
        const nodes = this.nodes();
        const id = this.pendingCenterId;
        if (!id) return;
        const node = scene.nodes.find(item => item.id === id);
        if (!node) {
            this.pendingCenterId = null;
            this.pendingCenterNodes = null;
            return;
        }
        if (node.childCount === 0 && nodes === this.pendingCenterNodes) return;
        this.pendingCenterId = null;
        this.pendingCenterNodes = null;
        this.centerNode(node);
    });

    private panOrigin: { pointerId: number; x: number; y: number } | null = null;
    private pendingPan: { pointerId: number; x: number; y: number } | null = null;
    private panEngaged = false;

    zoomPercent(): number {
        return Math.round(this.scale() * 100);
    }

    iconPath(name?: string): string {
        return name ? ICON_PATHS[name] ?? '' : '';
    }

    markerPara(color?: string): string {
        return color ? `${this.markerId}-${color.replace('#', '')}` : this.markerId;
    }

    headerRight(node: BpmCanvasSceneNode): number {
        return Math.min(node.width, CARD_WIDTH);
    }

    readonly shapeR = SHAPE_R;
    readonly shapeCy = SHAPE_TOP + SHAPE_R;
    readonly shapeTitleY = SHAPE_TOP + SHAPE_R * 2 + 18;
    readonly shapeMetaY = SHAPE_TOP + SHAPE_R * 2 + 35;

    diamondPoints(node: BpmCanvasSceneNode): string {
        const cx = node.width / 2;
        const mid = SHAPE_TOP + SHAPE_R;
        return `${cx},${SHAPE_TOP} ${cx + SHAPE_HALF_W},${mid} ${cx},${SHAPE_TOP + SHAPE_R * 2} ${cx - SHAPE_HALF_W},${mid}`;
    }

    iconoCentrado(node: BpmCanvasSceneNode): string {
        const x = node.width / 2 - ICON_SIZE / 2;
        return `translate(${x}, ${ICON_TOP}) scale(${ICON_SIZE / 24})`;
    }

    yTitulo(node: BpmCanvasSceneNode): number {
        if (node.shape === 'icon') return ICON_TITLE_Y;
        return node.shape ? this.shapeTitleY : 25;
    }

    yMetadata(node: BpmCanvasSceneNode, index: number): number {
        if (node.shape === 'icon') return ICON_META_Y;
        return node.shape ? this.shapeMetaY : 66 + index * 19;
    }

    zoomIn(): void {
        this.scale.update(value => Math.min(2.4, Number((value + 0.15).toFixed(2))));
    }

    zoomOut(): void {
        this.scale.update(value => Math.max(0.55, Number((value - 0.15).toFixed(2))));
    }

    resetView(): void {
        this.scale.set(1);
        this.panX.set(0);
        this.panY.set(0);
    }

    private centerNode(node: BpmCanvasSceneNode): void {
        const viewport = this.viewport()?.nativeElement;
        if (!viewport) return;
        const scale = this.scale();
        const centerX = node.x + node.width / 2;
        const centerY = node.y + node.height / 2;
        this.panX.set(Math.round(viewport.clientWidth / 2 + viewport.scrollLeft - centerX * scale));
        this.panY.set(Math.round(viewport.clientHeight / 2 + viewport.scrollTop - centerY * scale));
    }

    onWheel(event: WheelEvent): void {
        event.preventDefault();
        const delta = event.deltaY < 0 ? 0.08 : -0.08;
        this.scale.update(value => Math.max(0.55, Math.min(2.4, Number((value + delta).toFixed(2)))));
    }

    startPan(event: PointerEvent): void {
        this.panEngaged = false;
        this.pendingPan = null;
        if (event.button !== 0 || (event.target as Element).closest('[data-canvas-control]')) return;
        this.pendingPan = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
    }

    movePan(event: PointerEvent): void {
        if (this.pendingPan && this.pendingPan.pointerId === event.pointerId) {
            const dx = event.clientX - this.pendingPan.x;
            const dy = event.clientY - this.pendingPan.y;
            if (Math.abs(dx) + Math.abs(dy) < PAN_ENGAGE_PX) return;
            this.panOrigin = this.pendingPan;
            this.pendingPan = null;
            this.isPanning.set(true);
            this.panEngaged = true;
            (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
        }
        if (!this.panOrigin || this.panOrigin.pointerId !== event.pointerId) return;
        const deltaX = event.clientX - this.panOrigin.x;
        const deltaY = event.clientY - this.panOrigin.y;
        this.panX.update(value => value + deltaX / this.scale());
        this.panY.update(value => value + deltaY / this.scale());
        this.panOrigin.x = event.clientX;
        this.panOrigin.y = event.clientY;
    }

    endPan(event: PointerEvent): void {
        if (this.pendingPan && this.pendingPan.pointerId === event.pointerId) {
            this.pendingPan = null;
            return;
        }
        if (!this.panOrigin || this.panOrigin.pointerId !== event.pointerId) return;
        this.panOrigin = null;
        this.isPanning.set(false);
    }

    activateNode(node: BpmCanvasSceneNode, event?: Event): void {
        if (event instanceof MouseEvent && this.panEngaged) return;
        this.selectedNodeId.set(node.id);
        this.nodeActivated.emit(node);
    }

    activateNodeFromKeyboard(node: BpmCanvasSceneNode, event: KeyboardEvent): void {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        this.activateNode(node);
    }

    activateProperties(node: BpmCanvasSceneNode, event: Event): void {
        event.stopPropagation();
        this.selectedNodeId.set(node.id);
        this.nodeProperties.emit(node);
    }

    activatePropertiesFromKeyboard(node: BpmCanvasSceneNode, event: KeyboardEvent): void {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        this.activateProperties(node, event);
    }

    activateModal(node: BpmCanvasSceneNode, event: Event): void {
        event.stopPropagation();
        this.selectedNodeId.set(node.id);
        this.nodeModal.emit(node);
    }

    activateModalFromKeyboard(node: BpmCanvasSceneNode, event: KeyboardEvent): void {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        this.activateModal(node, event);
    }

    controlX(node: BpmCanvasSceneNode, control: 'expand' | 'properties' | 'modal'): number {
        const visible: string[] = [];
        if (node.childCount > 0 || node.hasChildren) visible.push('expand');
        if (node.hasProperties) visible.push('properties');
        if (node.modalAction) visible.push('modal');
        const index = visible.indexOf(control);
        return this.headerRight(node) - 30 - (index < 0 ? 0 : index) * 28;
    }

    modalLabel(node: BpmCanvasSceneNode): string {
        switch (node.modalAction) {
            case 'plantilla':
                return 'plantilla';
            case 'webservice':
                return 'web service';
            case 'mensaje':
                return 'mensaje';
            default:
                return 'acción';
        }
    }

    propertiesLabel(node: BpmCanvasSceneNode): string {
        return node.propertiesAction === 'formulario'
            ? 'Abrir formulario de ' + node.title
            : 'Ver propiedades de ' + node.title;
    }

    modalGlyph(node: BpmCanvasSceneNode): string {
        switch (node.modalAction) {
            case 'plantilla':
                return '▤';
            case 'webservice':
                return '⚙';
            case 'mensaje':
                return '✉';
            default:
                return '•';
        }
    }

    activateAction(action: BpmCanvasAction, event: Event): void {
        event.stopPropagation();
        this.actionActivated.emit(action);
    }

    activateActionFromKeyboard(action: BpmCanvasAction, event: KeyboardEvent): void {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        this.activateAction(action, event);
    }

    hasEdgeAction(edge: BpmCanvasEdge): boolean {
        return !!(edge.source as { plantilla?: string } | undefined)?.plantilla;
    }

    edgeTitle(edge: BpmCanvasEdge): string {
        const plantilla = (edge.source as { plantillaNombre?: string } | undefined)?.plantillaNombre;
        return plantilla ? `${edge.label ?? ''} — Plantilla: ${plantilla}` : edge.label ?? '';
    }

    activateEdge(edge: BpmCanvasEdge, event: Event): void {
        if (event instanceof MouseEvent && this.panEngaged) return;
        if (!this.hasEdgeAction(edge)) return;
        event.stopPropagation();
        this.edgeActivated.emit(edge);
    }

    activateEdgeFromKeyboard(edge: BpmCanvasEdge, event: KeyboardEvent): void {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        this.activateEdge(edge, event);
    }

    toggleNode(node: BpmCanvasNode, event?: Event): void {
        event?.stopPropagation();
        const next = new Set(this.activeExpandedNodeIds());
        const expanded = !next.has(node.id);
        if (expanded) {
            next.add(node.id);
            this.pendingCenterId = node.id;
            this.pendingCenterNodes = this.nodes();
        } else next.delete(node.id);
        this.expandedNodeIds.set(next);
        this.nodeToggle.emit({ node, expanded });
    }

    toggleNodeFromKeyboard(node: BpmCanvasSceneNode, event: KeyboardEvent): void {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        this.toggleNode(node, event);
    }

    visibleActions(node: BpmCanvasNode): BpmCanvasAction[] {
        return (node.actions || []).slice(0, 3);
    }

    remainingActionCount(node: BpmCanvasNode): number {
        return Math.max(0, (node.actions?.length || 0) - 3);
    }

    actionY(node: BpmCanvasNode): number {
        return this.cardActionsStart(node);
    }

    private cardActionsStart(node: BpmCanvasNode): number {
        const metadataCount = Math.min(node.metadata?.length || 0, 2);
        if (metadataCount) return 77 + metadataCount * 19;
        return (node.subtitle ? 56 : 40) + 6;
    }

    private cardTextEnd(node: BpmCanvasNode): number {
        return node.subtitle ? 56 : 40;
    }

    actionLabel(value: string): string {
        const maxLength = 25;
        return value.length > maxLength ? `${value.slice(0, maxLength - 1)}...` : value;
    }

    edgeLabel(value: string): string {
        const maxLength = 16;
        return value.length > maxLength ? `${value.slice(0, maxLength - 1)}...` : value;
    }

    private buildScene(
        mode: BpmCanvasMode,
        inputNodes: BpmCanvasNode[],
        inputEdges: BpmCanvasEdge[],
        expandedOverride: Set<string> | null,
    ): BpmCanvasScene {
        const nodes = [...new Map(inputNodes.filter(node => !!node.id).map(node => [node.id, node])).values()];
        if (!nodes.length) return { nodes: [], edges: [], width: 640, height: 320 };
        return mode === 'tree'
            ? this.buildTreeScene(nodes, expandedOverride)
            : this.buildFlowScene(nodes, inputEdges);
    }

    private buildTreeScene(nodes: BpmCanvasNode[], expandedOverride: Set<string> | null): BpmCanvasScene {
        const byId = new Map(nodes.map(node => [node.id, node]));
        const children = new Map<string, BpmCanvasNode[]>();
        const roots: BpmCanvasNode[] = [];
        for (const node of nodes) {
            const parent = node.parentId ? byId.get(node.parentId) : undefined;
            if (!parent || parent.id === node.id) {
                roots.push(node);
                continue;
            }
            const siblings = children.get(parent.id) || [];
            siblings.push(node);
            children.set(parent.id, siblings);
        }
        if (!roots.length) roots.push(nodes[0]);

        const expanded = expandedOverride || new Set(roots.map(node => node.id));
        const sceneNodes: BpmCanvasSceneNode[] = [];
        const placed = new Set<string>();
        const sizeById = new Map<string, { width: number; height: number }>();
        const sizing = new Set<string>();
        const flowLayoutById = new Map<string, TreeFlowLayout>();
        const flowBlockById = new Map<string, { x: number; y: number; returnBaseY: number; forwardBaseY: number }>();
        const flowParents: BpmCanvasNode[] = [];

        const subtreeSize = (node: BpmCanvasNode): { width: number; height: number } => {
            const memo = sizeById.get(node.id);
            if (memo) return memo;
            if (sizing.has(node.id)) return { width: this.nodeWidth(node), height: this.nodeHeight(node) };
            sizing.add(node.id);
            const kids = children.get(node.id) || [];
            const ownHeight = this.nodeHeight(node);
            let size = { width: this.nodeWidth(node), height: ownHeight };
            if (expanded.has(node.id) && kids.length) {
                if (node.childEdges !== undefined) {
                    const flow = flowLayoutOf(node, kids);
                    const alturaBloque = flow.blockH + (flow.iconBlockH > 0 ? flow.iconBlockH + CARD_GAP_Y : 0);
                    const extra = flow.returnCount * 22 + flow.aboveCount * 22 + 24 + this.selfLoopReserve(flow.selfLoopCount);
                    size = {
                        width: CARD_WIDTH + TREE_PAD_H + Math.max(flow.blockW, flow.iconBlockW) + TREE_PAD,
                        height: Math.max(ownHeight, alturaBloque + extra) + TREE_PAD * 2,
                    };
                } else {
                    const m = medidasHijos(kids);
                    size = {
                        width: CARD_WIDTH + TREE_PAD_H + m.width + TREE_PAD,
                        height: Math.max(ownHeight, m.height) + TREE_PAD * 2,
                    };
                }
            }
            sizing.delete(node.id);
            sizeById.set(node.id, size);
            return size;
        };

        const medidasHijos = (kids: BpmCanvasNode[]): {
            enFila: BpmCanvasNode[];
            enColumna: BpmCanvasNode[];
            filaWidth: number;
            filaHeight: number;
            colHeight: number;
            width: number;
            height: number;
            gap: number;
        } => {
            const enFila = kids.filter(kid => kid.horizontal);
            const enColumna = kids.filter(kid => !kid.horizontal);
            let filaWidth = 0;
            let filaHeight = 0;
            for (const kid of enFila) {
                const kidSize = subtreeSize(kid);
                filaWidth += kidSize.width + CARD_GAP_X;
                filaHeight = Math.max(filaHeight, kidSize.height);
            }
            filaWidth = Math.max(0, filaWidth - CARD_GAP_X);
            let colHeight = -CARD_GAP_Y;
            let colWidth = 0;
            for (const kid of enColumna) {
                const kidSize = subtreeSize(kid);
                colHeight += kidSize.height + CARD_GAP_Y;
                colWidth = Math.max(colWidth, kidSize.width);
            }
            if (!enColumna.length) colHeight = 0;
            const gap = filaHeight && colHeight ? CARD_GAP_Y : 0;
            return {
                enFila,
                enColumna,
                filaWidth,
                filaHeight,
                colHeight,
                width: Math.max(filaWidth, colWidth),
                height: filaHeight + gap + colHeight,
                gap,
            };
        };

        const flowLayoutOf = (node: BpmCanvasNode, kids: BpmCanvasNode[]): TreeFlowLayout => {
            const memo = flowLayoutById.get(node.id);
            if (memo) return memo;
            const kidIds = new Set(kids.map(kid => kid.id));
            const validEdges = (node.childEdges || []).filter(edge => kidIds.has(edge.from) && kidIds.has(edge.to));
            const iconKids = kids.filter(kid => kid.shape === 'icon');
            const flowKids = kids.filter(kid => kid.shape !== 'icon');
            const incoming = new Map(flowKids.map(kid => [kid.id, 0]));
            const outgoing = new Map<string, string[]>();
            for (const edge of validEdges) {
                incoming.set(edge.to, (incoming.get(edge.to) || 0) + 1);
                const list = outgoing.get(edge.from) || [];
                list.push(edge.to);
                outgoing.set(edge.from, list);
            }
            const participantes = new Set<string>();
            for (const edge of validEdges) {
                participantes.add(edge.from);
                participantes.add(edge.to);
            }
            const depthOf = new Map<string, number>();
            let queue = flowKids.filter(kid => incoming.get(kid.id) === 0 && participantes.has(kid.id)).map(kid => kid.id);
            if (!queue.length && participantes.size) {
                const primero = flowKids.find(kid => participantes.has(kid.id));
                if (primero) queue = [primero.id];
            }
            for (const rootId of queue) depthOf.set(rootId, 0);
            for (let index = 0; index < queue.length; index++) {
                const from = queue[index];
                const nextDepth = (depthOf.get(from) || 0) + 1;
                for (const to of outgoing.get(from) || []) {
                    if (depthOf.has(to)) continue;
                    depthOf.set(to, nextDepth);
                    queue.push(to);
                }
            }
            const order = flowKids
                .map((kid, kidIndex) => ({ kid, kidIndex }))
                .sort((a, b) => {
                    const da = depthOf.get(a.kid.id);
                    const db = depthOf.get(b.kid.id);
                    if (da === undefined && db === undefined) return a.kidIndex - b.kidIndex;
                    if (da === undefined) return 1;
                    if (db === undefined) return -1;
                    return da - db || a.kidIndex - b.kidIndex;
                });
            const colOf = new Map<string, number>();
            const rowOf = new Map<string, number>();
            const colX = new Map<number, number>();
            let blockW = 0;
            let blockH = 0;
            let xCursor = 0;
            for (const [position, entry] of order.entries()) {
                colOf.set(entry.kid.id, position);
                rowOf.set(entry.kid.id, 0);
                colX.set(position, xCursor);
                const kidSize = subtreeSize(entry.kid);
                blockH = Math.max(blockH, kidSize.height);
                xCursor += kidSize.width + CARD_GAP_X;
            }
            blockW = Math.max(0, xCursor - CARD_GAP_X);
            let iconBlockW = 0;
            let iconBlockH = 0;
            let iconCursor = 0;
            for (const kid of iconKids) {
                const kidSize = subtreeSize(kid);
                iconBlockH = Math.max(iconBlockH, kidSize.height);
                iconCursor += kidSize.width + CARD_GAP_X;
            }
            iconBlockW = Math.max(0, iconCursor - CARD_GAP_X);
            let returnCount = 0;
            let aboveCount = 0;
            let selfLoopCount = 0;
            for (const edge of validEdges) {
                if (edge.from === edge.to) {
                    selfLoopCount++;
                    continue;
                }
                const fromCol = colOf.get(edge.from) ?? 0;
                const toCol = colOf.get(edge.to) ?? 0;
                if (toCol === fromCol + 1) continue;
                if (toCol > fromCol + 1) aboveCount++;
                else returnCount++;
            }
            const layout: TreeFlowLayout = {
                colOf,
                colX,
                rowOf,
                blockW,
                blockH,
                returnCount,
                aboveCount,
                selfLoopCount,
                iconKids,
                iconBlockW,
                iconBlockH,
            };
            flowLayoutById.set(node.id, layout);
            return layout;
        };

        const place = (node: BpmCanvasNode, x: number, y: number, depth: number, ancestry: Set<string>): void => {
            if (placed.has(node.id) || ancestry.has(node.id)) return;
            placed.add(node.id);
            const kids = children.get(node.id) || [];
            const size = subtreeSize(node);
            const sceneNode: BpmCanvasSceneNode = {
                ...node,
                x,
                y,
                width: size.width,
                height: size.height,
                depth,
                childCount: kids.length,
                expanded: expanded.has(node.id),
            };
            sceneNodes.push(sceneNode);
            if (!expanded.has(node.id) || !kids.length) return;
            const nextAncestry = new Set(ancestry).add(node.id);
            if (node.childEdges !== undefined) {
                const flow = flowLayoutOf(node, kids);
                const conFilaIconos = flow.iconBlockH > 0;
                const extraIconos = conFilaIconos ? flow.iconBlockH + CARD_GAP_Y : 0;
                const extraBelow = flow.returnCount * 22 + 16 + this.selfLoopReserve(flow.selfLoopCount) + extraIconos;
                const extraAbove = flow.aboveCount * 22 + 8;
                const blockX = x + CARD_WIDTH + TREE_PAD_H;
                const blockY = y + (size.height - (flow.blockH + extraBelow + extraAbove)) / 2 + extraAbove;
                flowBlockById.set(node.id, {
                    x: blockX,
                    y: blockY,
                    returnBaseY: blockY + flow.blockH + 12 + this.selfLoopReserve(flow.selfLoopCount),
                    forwardBaseY: blockY - 12,
                });
                for (const kid of kids) {
                    if (kid.shape === 'icon') continue;
                    const col = flow.colOf.get(kid.id) ?? 0;
                    const kidX = blockX + (flow.colX.get(col) ?? 0);
                    const kidY = blockY + (flow.rowOf.get(kid.id) ?? 0);
                    place(kid, kidX, kidY, depth + 1 + col, nextAncestry);
                }
                if (conFilaIconos) {
                    let iconX = blockX;
                    const iconY =
                        blockY + flow.blockH + 12 + this.selfLoopReserve(flow.selfLoopCount) + flow.returnCount * 22 + CARD_GAP_Y;
                    for (const kid of flow.iconKids) {
                        const kidSize = subtreeSize(kid);
                        place(kid, iconX, iconY, depth + 1, nextAncestry);
                        iconX += kidSize.width + CARD_GAP_X;
                    }
                }
                flowParents.push(node);
                return;
            }
            const m = medidasHijos(kids);
            const childX = x + CARD_WIDTH + TREE_PAD_H;
            let childY = y + (size.height - m.height) / 2;
            let filaX = childX;
            for (const kid of m.enFila) {
                const kidSize = subtreeSize(kid);
                place(kid, filaX, childY + (m.filaHeight - kidSize.height) / 2, depth + 1, nextAncestry);
                filaX += kidSize.width + CARD_GAP_X;
            }
            if (m.filaHeight) childY += m.filaHeight + m.gap;
            for (const kid of m.enColumna) {
                const kidSize = subtreeSize(kid);
                place(kid, childX, childY, depth + 1, nextAncestry);
                childY += kidSize.height + CARD_GAP_Y;
            }
        };

        let rootX = CANVAS_PADDING;
        for (const root of roots) {
            if (placed.has(root.id)) continue;
            const size = subtreeSize(root);
            place(root, rootX, CANVAS_PADDING, 0, new Set());
            rootX += size.width + CARD_GAP_X;
        }

        const positionById = new Map(sceneNodes.map(node => [node.id, node]));
        const sceneEdges: BpmCanvasSceneEdge[] = [];
        for (const parent of flowParents) {
            const block = flowBlockById.get(parent.id);
            const flow = flowLayoutById.get(parent.id);
            if (!block || !flow) continue;
            let belowLane = 0;
            let aboveLane = 0;
            let selfLoopIndex = 0;
            for (const edge of parent.childEdges || []) {
                const from = positionById.get(edge.from);
                const to = positionById.get(edge.to);
                if (!from || !to) continue;
                if (edge.from === edge.to) {
                    sceneEdges.push(this.routeSelfLoop(edge, from, selfLoopIndex));
                    selfLoopIndex++;
                    continue;
                }
                const fromCol = flow.colOf.get(edge.from) ?? 0;
                const toCol = flow.colOf.get(edge.to) ?? 0;
                if (toCol === fromCol + 1) {
                    sceneEdges.push(this.routeEdge(edge, from, to));
                } else if (toCol > fromCol + 1) {
                    sceneEdges.push(this.routeEdge(edge, from, to, block.forwardBaseY - aboveLane * 22));
                    aboveLane++;
                } else {
                    sceneEdges.push(this.routeEdge(edge, from, to, block.returnBaseY + belowLane * 22));
                    belowLane++;
                }
            }
        }

        let maxRight = CANVAS_PADDING;
        let maxBottom = CANVAS_PADDING;
        for (const node of sceneNodes) {
            maxRight = Math.max(maxRight, node.x + node.width);
            maxBottom = Math.max(maxBottom, node.y + node.height);
        }
        return {
            nodes: sceneNodes,
            edges: sceneEdges,
            width: maxRight + CANVAS_PADDING,
            height: Math.max(320, maxBottom + CANVAS_PADDING),
        };
    }

    private buildFlowScene(nodes: BpmCanvasNode[], inputEdges: BpmCanvasEdge[]): BpmCanvasScene {
        const byId = new Map(nodes.map(node => [node.id, node]));
        const edges = inputEdges.filter(edge => byId.has(edge.from) && byId.has(edge.to));
        const incomingCount = new Map(nodes.map(node => [node.id, 0]));
        const outgoing = new Map<string, BpmCanvasEdge[]>();
        for (const edge of edges) {
            incomingCount.set(edge.to, (incomingCount.get(edge.to) || 0) + 1);
            const adjacent = outgoing.get(edge.from) || [];
            adjacent.push(edge);
            outgoing.set(edge.from, adjacent);
        }

        const depthById = new Map<string, number>();
        const queue = nodes.filter(node => incomingCount.get(node.id) === 0).map(node => node.id);
        if (!queue.length) queue.push(nodes[0].id);
        const assignDepths = (): void => {
            for (let index = 0; index < queue.length; index++) {
                const from = queue[index];
                const nextDepth = (depthById.get(from) || 0) + 1;
                for (const edge of outgoing.get(from) || []) {
                    if (depthById.has(edge.to)) continue;
                    depthById.set(edge.to, nextDepth);
                    queue.push(edge.to);
                }
            }
        };
        depthById.set(queue[0], 0);
        assignDepths();
        for (const node of nodes) {
            if (depthById.has(node.id)) continue;
            depthById.set(node.id, 0);
            queue.push(node.id);
            assignDepths();
        }

        const order = nodes
            .map((node, nodeIndex) => ({ node, nodeIndex }))
            .sort((a, b) => {
                const da = depthById.get(a.node.id) ?? Number.MAX_SAFE_INTEGER;
                const db = depthById.get(b.node.id) ?? Number.MAX_SAFE_INTEGER;
                return da - db || a.nodeIndex - b.nodeIndex;
            });
        const sceneNodes: BpmCanvasSceneNode[] = [];
        const positionById = new Map<string, BpmCanvasSceneNode>();
        const positionOf = new Map<string, number>();
        for (const [position, entry] of order.entries()) positionOf.set(entry.node.id, position);
        let aboveCount = 0;
        let belowCount = 0;
        let selfLoopCount = 0;
        for (const edge of edges) {
            if (edge.from === edge.to) {
                selfLoopCount++;
                continue;
            }
            const fromPos = positionOf.get(edge.from) ?? 0;
            const toPos = positionOf.get(edge.to) ?? 0;
            if (toPos === fromPos + 1) continue;
            if (toPos > fromPos + 1) aboveCount++;
            else belowCount++;
        }
        const loopReserve = this.selfLoopReserve(selfLoopCount);
        const extraAbove = aboveCount * 22 + 8;
        const aboveBaseY = CANVAS_PADDING + extraAbove - 12;
        const rowY = CANVAS_PADDING + extraAbove;
        let maxBottom = CANVAS_PADDING;
        for (const [position, entry] of order.entries()) {
            const sceneNode: BpmCanvasSceneNode = {
                ...entry.node,
                x: CANVAS_PADDING + position * (CARD_WIDTH + CARD_GAP_X),
                y: rowY,
                width: CARD_WIDTH,
                height: this.nodeHeight(entry.node),
                depth: depthById.get(entry.node.id) ?? 0,
                childCount: 0,
                expanded: false,
            };
            sceneNodes.push(sceneNode);
            positionById.set(entry.node.id, sceneNode);
            maxBottom = Math.max(maxBottom, sceneNode.y + sceneNode.height);
        }

        let aboveLane = 0;
        let belowLane = 0;
        const selfLoopIndexById = new Map<string, number>();
        const sceneEdges = edges.map(edge => {
            const from = positionById.get(edge.from)!;
            const to = positionById.get(edge.to)!;
            if (edge.from === edge.to) {
                const index = selfLoopIndexById.get(edge.from) ?? 0;
                selfLoopIndexById.set(edge.from, index + 1);
                return this.routeSelfLoop(edge, from, index);
            }
            const fromPos = positionOf.get(edge.from) ?? 0;
            const toPos = positionOf.get(edge.to) ?? 0;
            if (toPos === fromPos + 1) return this.routeEdge(edge, from, to);
            if (toPos > fromPos + 1) {
                const routeY = aboveBaseY - aboveLane * 22;
                aboveLane++;
                return this.routeEdge(edge, from, to, routeY);
            }
            const routeY = maxBottom + 20 + loopReserve + belowLane * 22;
            belowLane++;
            return this.routeEdge(edge, from, to, routeY);
        });
        const canvasHeight = Math.max(320, maxBottom + CANVAS_PADDING + belowCount * 22 + loopReserve);
        const canvasWidth = order.length
            ? CANVAS_PADDING * 2 + order.length * CARD_WIDTH + (order.length - 1) * CARD_GAP_X
            : CANVAS_PADDING * 2;
        return {
            nodes: sceneNodes,
            edges: sceneEdges,
            width: canvasWidth,
            height: canvasHeight,
        };
    }

    private routeEdge(
        edge: BpmCanvasEdge,
        from: BpmCanvasSceneNode,
        to: BpmCanvasSceneNode,
        routeY?: number,
    ): BpmCanvasSceneEdge {
        const startX = this.edgeStartX(from);
        const startY = this.edgeY(from);
        const endX = this.edgeEndX(to);
        const endY = this.edgeY(to);
        if (routeY !== undefined) {
            const exitX = startX + 16;
            const approachX = endX - 16;
            return {
                ...edge,
                path: `M ${startX} ${startY} H ${exitX} V ${routeY} H ${approachX} V ${endY} H ${endX}`,
                labelX: (startX + endX) / 2,
                labelY: routeY - 5,
            };
        }
        const midX = (startX + endX) / 2;
        return { ...edge, path: `M ${startX} ${startY} H ${midX} V ${endY} H ${endX}`, labelX: midX, labelY: Math.min(startY, endY) - 9 };
    }

    private routeSelfLoop(edge: BpmCanvasEdge, node: BpmCanvasSceneNode, index: number): BpmCanvasSceneEdge {
        const startY = this.edgeY(node);
        const startX = this.edgeStartX(node);
        const endX = this.edgeEndX(node);
        const centerX = node.x + node.width / 2;
        const halfSpread = SELF_LOOP_SPREAD + index * 12;
        const bottom = startY + SELF_LOOP_DROP + index * SELF_LOOP_STRIDE;
        return {
            ...edge,
            path: `M ${startX} ${startY} H ${centerX + halfSpread} V ${bottom} H ${centerX - halfSpread} V ${startY} H ${endX}`,
            labelX: centerX,
            labelY: bottom - 5,
        };
    }

    private selfLoopReserve(count: number): number {
        if (count <= 0) return 0;
        return SELF_LOOP_DROP + (count - 1) * SELF_LOOP_STRIDE - (SHAPE_HEIGHT - SHAPE_TOP - SHAPE_R) + 12;
    }

    private nodeWidth(node: BpmCanvasNode): number {
        if (node.shape === 'icon') return ICON_SLOT;
        return node.shape ? SHAPE_SLOT : CARD_WIDTH;
    }

    private edgeStartX(node: BpmCanvasSceneNode): number {
        if (!node.shape) return node.x + node.width;
        return node.x + node.width / 2 + (node.shape === 'circle' ? SHAPE_R : SHAPE_HALF_W);
    }

    private edgeEndX(node: BpmCanvasSceneNode): number {
        if (!node.shape) return node.x;
        return node.x + node.width / 2 - (node.shape === 'circle' ? SHAPE_R : SHAPE_HALF_W);
    }

    private edgeY(node: BpmCanvasSceneNode): number {
        return node.shape ? node.y + SHAPE_TOP + SHAPE_R : node.y + node.height / 2;
    }

    private nodeHeight(node: BpmCanvasNode): number {
        if (node.shape === 'icon') return ICON_HEIGHT;
        if (node.shape) return SHAPE_HEIGHT;
        const metadataCount = Math.min(node.metadata?.length || 0, 2);
        const actionCount = Math.min(node.actions?.length || 0, 3);
        const overflowLabelHeight = (node.actions?.length || 0) > 3 ? 18 : 0;
        const metadataEnd = metadataCount ? 66 + (metadataCount - 1) * 19 + 14 : 0;
        const contentEnd = Math.max(this.cardTextEnd(node), metadataEnd);
        if (!actionCount) return contentEnd;
        return this.cardActionsStart(node) + actionCount * 27 + overflowLabelHeight;
    }

    private activeExpandedNodeIds(): Set<string> {
        const explicit = this.expandedNodeIds();
        if (explicit) return explicit;
        const allIds = new Set(this.nodes().map(node => node.id));
        const roots = this.nodes().filter(node => !node.parentId || !allIds.has(node.parentId));
        return new Set((roots.length ? roots : this.nodes().slice(0, 1)).map(node => node.id));
    }
}