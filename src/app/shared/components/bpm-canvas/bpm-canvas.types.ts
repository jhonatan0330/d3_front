export type BpmCanvasMode = 'tree' | 'flow';

export const BPM_EDGE_COLORS = [
    '#0f766e',
    '#7c3aed',
    '#b45309',
    '#1d4ed8',
    '#be123c',
    '#047857',
    '#a21caf',
    '#475569',
];

export interface BpmCanvasMetadata {
    label: string;
    value: string;
}

export interface BpmCanvasAction {
    id: string;
    label: string;
    targetId?: string;
    templateId?: string;
    source?: unknown;
}

export interface BpmCanvasNode {
    id: string;
    title: string;
    subtitle?: string;
    parentId?: string | null;
    metadata?: BpmCanvasMetadata[];
    actions?: BpmCanvasAction[];
    source?: unknown;
    hasChildren?: boolean;
    hasProperties?: boolean;
    modalAction?: 'plantilla' | 'webservice' | 'mensaje';
    shape?: 'circle' | 'diamond' | 'icon';
    shapeFill?: string;
    horizontal?: boolean;
    icon?: string;
    childEdges?: BpmCanvasEdge[];
}

export interface BpmCanvasLegendItem {
    icon: string;
    label: string;
}

export interface BpmCanvasEdge {
    id: string;
    from: string;
    to: string;
    label?: string;
    color?: string;
    source?: unknown;
}

export interface BpmCanvasSceneNode extends BpmCanvasNode {
    x: number;
    y: number;
    width: number;
    height: number;
    depth: number;
    childCount: number;
    expanded: boolean;
}

export interface BpmCanvasSceneEdge extends BpmCanvasEdge {
    path: string;
    labelX: number;
    labelY: number;
}

export interface BpmCanvasScene {
    nodes: BpmCanvasSceneNode[];
    edges: BpmCanvasSceneEdge[];
    width: number;
    height: number;
}