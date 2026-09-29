import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import {
    BpmCanvasAction,
    BpmCanvasEdge,
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

let canvasSequence = 0;

@Component({
    selector: 'bpm-canvas',
    standalone: true,
    imports: [],
    templateUrl: './bpm-canvas.component.html',
    styleUrls: ['./bpm-canvas.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BpmCanvasComponent {
    readonly mode = input<BpmCanvasMode>('flow');
    readonly nodes = input<BpmCanvasNode[]>([]);
    readonly edges = input<BpmCanvasEdge[]>([]);
    readonly nodeActivated = output<BpmCanvasNode>();
    readonly actionActivated = output<BpmCanvasAction>();

    readonly expandedNodeIds = signal<Set<string> | null>(null);
    readonly selectedNodeId = signal<string | null>(null);
    readonly scale = signal(1);
    readonly panX = signal(0);
    readonly panY = signal(0);
    readonly isPanning = signal(false);
    readonly markerId = `bpm-canvas-arrow-${++canvasSequence}`;
    readonly scene = computed(() => this.buildScene(
        this.mode(),
        this.nodes(),
        this.edges(),
        this.expandedNodeIds(),
    ));

    private panOrigin: { pointerId: number; x: number; y: number } | null = null;

    zoomPercent(): number {
        return Math.round(this.scale() * 100);
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

    onWheel(event: WheelEvent): void {
        event.preventDefault();
        const delta = event.deltaY < 0 ? 0.08 : -0.08;
        this.scale.update(value => Math.max(0.55, Math.min(2.4, Number((value + delta).toFixed(2)))));
    }

    startPan(event: PointerEvent): void {
        if (event.button !== 0 || (event.target as Element).closest('[data-canvas-control], [role="button"]')) return;
        this.panOrigin = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
        this.isPanning.set(true);
        (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    }

    movePan(event: PointerEvent): void {
        if (!this.panOrigin || this.panOrigin.pointerId !== event.pointerId) return;
        const deltaX = event.clientX - this.panOrigin.x;
        const deltaY = event.clientY - this.panOrigin.y;
        this.panX.update(value => value + deltaX / this.scale());
        this.panY.update(value => value + deltaY / this.scale());
        this.panOrigin.x = event.clientX;
        this.panOrigin.y = event.clientY;
    }

    endPan(event: PointerEvent): void {
        if (!this.panOrigin || this.panOrigin.pointerId !== event.pointerId) return;
        this.panOrigin = null;
        this.isPanning.set(false);
    }

    activateNode(node: BpmCanvasSceneNode): void {
        this.selectedNodeId.set(node.id);
        this.nodeActivated.emit(node);
    }

    activateNodeFromKeyboard(node: BpmCanvasSceneNode, event: KeyboardEvent): void {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        this.activateNode(node);
    }

    activateAction(action: BpmCanvasAction, event: Event): void {
        event.stopPropagation();
        this.actionActivated.emit(action);
    }

    activateActionFromKeyboard(action: BpmCanvasAction, event: KeyboardEvent): void {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        this.actionActivated.emit(action);
    }

    toggleNode(node: BpmCanvasSceneNode, event: Event): void {
        event.stopPropagation();
        const next = new Set(this.activeExpandedNodeIds());
        if (next.has(node.id)) next.delete(node.id);
        else next.add(node.id);
        this.expandedNodeIds.set(next);
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
        const metadataCount = Math.min(node.metadata?.length || 0, 2);
        return 77 + metadataCount * 19;
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
        const visible = new Map<string, { node: BpmCanvasNode; depth: number }>();
        const visit = (node: BpmCanvasNode, depth: number, ancestry: Set<string>): void => {
            if (visible.has(node.id) || ancestry.has(node.id)) return;
            visible.set(node.id, { node, depth });
            if (!expanded.has(node.id)) return;
            const nextAncestry = new Set(ancestry).add(node.id);
            for (const child of children.get(node.id) || []) visit(child, depth + 1, nextAncestry);
        };
        roots.forEach(root => visit(root, 0, new Set()));
        for (const node of nodes) {
            if (!visible.has(node.id)) visit(node, 0, new Set());
        }

        const columns = new Map<number, Array<{ node: BpmCanvasNode; depth: number }>>();
        for (const item of visible.values()) {
            const column = columns.get(item.depth) || [];
            column.push(item);
            columns.set(item.depth, column);
        }
        const sceneNodes: BpmCanvasSceneNode[] = [];
        const positionById = new Map<string, BpmCanvasSceneNode>();
        let maxDepth = 0;
        let maxBottom = CANVAS_PADDING;
        for (const [depth, column] of columns) {
            maxDepth = Math.max(maxDepth, depth);
            let y = CANVAS_PADDING;
            for (const { node } of column) {
                const height = this.nodeHeight(node);
                const childCount = (children.get(node.id) || []).length;
                const sceneNode: BpmCanvasSceneNode = {
                    ...node,
                    x: CANVAS_PADDING + depth * (CARD_WIDTH + CARD_GAP_X),
                    y,
                    width: CARD_WIDTH,
                    height,
                    depth,
                    childCount,
                    expanded: expanded.has(node.id),
                };
                sceneNodes.push(sceneNode);
                positionById.set(node.id, sceneNode);
                y += height + CARD_GAP_Y;
                maxBottom = Math.max(maxBottom, y);
            }
        }

        const sceneEdges: BpmCanvasSceneEdge[] = [];
        for (const node of sceneNodes) {
            const parent = node.parentId ? positionById.get(node.parentId) : undefined;
            if (!parent) continue;
            sceneEdges.push(this.routeEdge(
                { id: `tree:${parent.id}:${node.id}`, from: parent.id, to: node.id },
                parent,
                node,
                0,
            ));
        }
        return {
            nodes: sceneNodes,
            edges: sceneEdges,
            width: CANVAS_PADDING * 2 + (maxDepth + 1) * CARD_WIDTH + maxDepth * CARD_GAP_X,
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

        const columns = new Map<number, BpmCanvasNode[]>();
        for (const node of nodes) {
            const depth = depthById.get(node.id) || 0;
            const column = columns.get(depth) || [];
            column.push(node);
            columns.set(depth, column);
        }
        const sceneNodes: BpmCanvasSceneNode[] = [];
        const positionById = new Map<string, BpmCanvasSceneNode>();
        let maxDepth = 0;
        let maxBottom = CANVAS_PADDING;
        for (const [depth, column] of columns) {
            maxDepth = Math.max(maxDepth, depth);
            let y = CANVAS_PADDING;
            for (const node of column) {
                const sceneNode: BpmCanvasSceneNode = {
                    ...node,
                    x: CANVAS_PADDING + depth * (CARD_WIDTH + CARD_GAP_X),
                    y,
                    width: CARD_WIDTH,
                    height: this.nodeHeight(node),
                    depth,
                    childCount: 0,
                    expanded: false,
                };
                sceneNodes.push(sceneNode);
                positionById.set(node.id, sceneNode);
                y += sceneNode.height + CARD_GAP_Y;
                maxBottom = Math.max(maxBottom, y);
            }
        }

        let returnLane = 0;
        const sceneEdges = edges.map(edge => {
            const from = positionById.get(edge.from)!;
            const to = positionById.get(edge.to)!;
            const isReturn = to.depth <= from.depth;
            const lane = isReturn ? ++returnLane : 0;
            return this.routeEdge(edge, from, to, lane, isReturn ? maxBottom + 20 : undefined);
        });
        const canvasHeight = Math.max(320, maxBottom + CANVAS_PADDING + returnLane * 22);
        return {
            nodes: sceneNodes,
            edges: sceneEdges,
            width: CANVAS_PADDING * 2 + (maxDepth + 1) * CARD_WIDTH + maxDepth * CARD_GAP_X,
            height: canvasHeight,
        };
    }

    private routeEdge(
        edge: BpmCanvasEdge,
        from: BpmCanvasSceneNode,
        to: BpmCanvasSceneNode,
        returnLane: number,
        returnBaseY?: number,
    ): BpmCanvasSceneEdge {
        const startX = from.x + from.width;
        const startY = from.y + from.height / 2;
        const endX = to.x;
        const endY = to.y + to.height / 2;
        if (returnBaseY !== undefined) {
            const routeY = returnBaseY + (returnLane - 1) * 22;
            return { ...edge, path: `M ${startX} ${startY} V ${routeY} H ${endX} V ${endY}`, labelX: (startX + endX) / 2, labelY: routeY - 5 };
        }
        const midX = (startX + endX) / 2;
        return { ...edge, path: `M ${startX} ${startY} H ${midX} V ${endY} H ${endX}`, labelX: midX, labelY: Math.min(startY, endY) - 9 };
    }

    private nodeHeight(node: BpmCanvasNode): number {
        const metadataCount = Math.min(node.metadata?.length || 0, 2);
        const actionCount = Math.min(node.actions?.length || 0, 3);
        const overflowLabelHeight = (node.actions?.length || 0) > 3 ? 18 : 0;
        return Math.max(112, 77 + metadataCount * 19 + actionCount * 27 + overflowLabelHeight);
    }

    private activeExpandedNodeIds(): Set<string> {
        const explicit = this.expandedNodeIds();
        if (explicit) return explicit;
        const allIds = new Set(this.nodes().map(node => node.id));
        const roots = this.nodes().filter(node => !node.parentId || !allIds.has(node.parentId));
        return new Set((roots.length ? roots : this.nodes().slice(0, 1)).map(node => node.id));
    }
}