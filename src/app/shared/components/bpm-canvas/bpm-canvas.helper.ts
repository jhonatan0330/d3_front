import { signal } from '@angular/core';
import { BpmCanvasLegendItem } from './bpm-canvas.types';

const PAN_ENGAGE_PX = 4;
const ZOOM_MIN = 0.55;
const ZOOM_MAX = 2.4;
const ZOOM_STEP = 0.15;
const WHEEL_STEP = 0.08;

export const ICON_PATHS: Record<string, string> = {
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
    diamond: 'M12 2 22 12 12 22 2 12zM12 6.5 17.5 12 12 17.5 6.5 12z',
};

export const BPM_CANVAS_LEGEND_ITEMS: BpmCanvasLegendItem[] = [
    { icon: 'building', label: 'Organización' },
    { icon: 'folder', label: 'Macroproceso' },
    { icon: 'process', label: 'Proceso' },
    { icon: 'state', label: 'Estado' },
    { icon: 'diamond', label: 'Decisión / Iterador' },
    { icon: 'transition', label: 'Transición' },
    { icon: 'document', label: 'Plantilla' },
    { icon: 'report', label: 'Reporte' },
    { icon: 'person', label: 'Rol' },
    { icon: 'api', label: 'API' },
];

export function iconPath(name?: string): string {
    return name ? ICON_PATHS[name] ?? '' : '';
}

export class BpmCanvasView {
    readonly scale = signal(1);
    readonly panX = signal(0);
    readonly panY = signal(0);
    readonly isPanning = signal(false);

    private panOrigin: { pointerId: number; x: number; y: number } | null = null;
    private pendingPan: { pointerId: number; x: number; y: number } | null = null;
    private panEngaged = false;

    get engaged(): boolean {
        return this.panEngaged;
    }

    percent(): number {
        return Math.round(this.scale() * 100);
    }

    zoomIn(): void {
        this.scale.update(value => Math.min(ZOOM_MAX, Number((value + ZOOM_STEP).toFixed(2))));
    }

    zoomOut(): void {
        this.scale.update(value => Math.max(ZOOM_MIN, Number((value - ZOOM_STEP).toFixed(2))));
    }

    reset(): void {
        this.scale.set(1);
        this.panX.set(0);
        this.panY.set(0);
    }

    onWheel(event: WheelEvent): void {
        event.preventDefault();
        const delta = event.deltaY < 0 ? WHEEL_STEP : -WHEEL_STEP;
        this.scale.update(value => Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, Number((value + delta).toFixed(2)))));
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
}
