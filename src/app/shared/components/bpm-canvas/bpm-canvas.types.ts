export type BpmCanvasMode = 'tree' | 'flow';

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
}

export interface BpmCanvasEdge {
    id: string;
    from: string;
    to: string;
    label?: string;
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