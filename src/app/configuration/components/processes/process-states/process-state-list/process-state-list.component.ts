import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { ProcesoEstadoDTO } from 'app/document/document.types';
import { ProcessService } from 'app/configuration/configuracion.api';
import { ProcessStateFormComponent } from '../process-state-form/process-state-form.component';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';

export const PROCESO_ESTADO_TIPO_LABELS: Record<string, string> = {
    E: 'Estado',
    D: 'Decisión',
    R: 'Iterador',
    P: 'API',
};

export const PROCESO_ESTADO_DOCUMENTO_LABELS: Record<string, string> = {
    A: 'Activo',
    C: 'Finalizado',
    I: 'Inactivo',
};

const PROCESO_ESTADO_TIPO_ICONOS: Record<string, string> = {
    E: 'radio_button_checked',
    D: 'call_split',
    R: 'repeat',
    P: 'api',
};

@Component({
    selector: 'app-process-state-list',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule, MatTooltipModule, DragDropModule],
    templateUrl: './process-state-list.component.html',
})
export class ProcessStateListComponent implements OnInit, OnChanges {
    private notificationCenter = inject(NotificationCenterService);
    private service = inject(ProcessService);
    private dialog = inject(MatDialog);

    @Input() processKey!: string;
    @Output() stateSaved = new EventEmitter<ProcesoEstadoDTO>();

    states = signal<ProcesoEstadoDTO[]>([]);
    loading = signal(false);
    mostrarInactivos = signal(false);

    activos = computed(() => this.states().filter((s) => s.estado === 'A'));
    inactivos = computed(() => this.states().filter((s) => s.estado !== 'A'));
    totalInactivos = computed(() => this.inactivos().length);

    ngOnInit(): void {
        if (this.processKey) {
            this.loadStates();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['processKey'] && !changes['processKey'].firstChange) {
            this.loadStates();
        }
    }

    loadStates(): void {
        if (!this.processKey) {
            this.states.set([]);
            this.loading.set(false);
            return;
        }
        this.loading.set(true);
        this.service.getStates(this.processKey, null).subscribe({
            next: (res) => { this.states.set(res ?? []); this.loading.set(false); },
            error: () => { this.states.set([]); this.loading.set(false); }
        });
    }

    toggleInactivos(): void {
        this.mostrarInactivos.update((value) => !value);
    }

    tipoLabel(tipo: string): string {
        return PROCESO_ESTADO_TIPO_LABELS[tipo] || tipo || '-';
    }

    tipoIcono(tipo: string): string {
        return PROCESO_ESTADO_TIPO_ICONOS[tipo] || 'help_outline';
    }

    estadoDocumentoLabel(estadoDocumento: string): string {
        return PROCESO_ESTADO_DOCUMENTO_LABELS[estadoDocumento] || estadoDocumento || '-';
    }

    getStatePreview(state: ProcesoEstadoDTO): string {
        const parts: string[] = [];
        if (state.prioridad) parts.push(`Avance: ${state.prioridad}`);
        if (state.estadoDocumento) parts.push(`Estado documento: ${this.estadoDocumentoLabel(state.estadoDocumento)}`);
        return parts.join(' | ') || 'Sin detalles';
    }

    openStateForm(state?: ProcesoEstadoDTO): void {
        const dialogRef = this.dialog.open(ProcessStateFormComponent, {
            width: '700px', maxWidth: '90vw', disableClose: true,
            data: { id: state?.llaveTabla, processId: this.processKey }
        });
        dialogRef.afterClosed().subscribe((result: ProcesoEstadoDTO) => {
            if (result) {
                this.stateSaved.emit(result);
                this.loadStates();
            }
        });
    }

    drop(event: CdkDragDrop<ProcesoEstadoDTO[]>): void {
        if (event.previousIndex === event.currentIndex) {
            return;
        }

        const activos = [...this.activos()];
        moveItemInArray(activos, event.previousIndex, event.currentIndex);

        const siguientes = [...this.states()];
        const activosKey = new Set(activos.map((state) => state.llaveTabla));

        const reorderedStates = [
            ...activos,
            ...siguientes.filter((state) => !activosKey.has(state.llaveTabla))
        ];

        const prioridades = new Map(activos.map((state, index) => [state.llaveTabla, index + 1]));

        this.states.set(reorderedStates.map((state) => {
            const prioridad = prioridades.get(state.llaveTabla);
            return prioridad && state.estado === 'A' ? { ...state, prioridad } : state;
        }));

        const movedState = { ...activos[event.currentIndex], prioridad: event.currentIndex + 1 };
        if (!movedState.nodoSuperior) {
            movedState.nodoSuperior = this.processKey;
        }

        this.service.updateState(movedState).subscribe({
            next: () => {
                this.loadStates();
            },
            error: () => this.loadStates()
        });
    }

    toggleStatus(item: ProcesoEstadoDTO): void {
        const newEstado = item.estado === 'A' ? 'I' : 'A';
        const action = newEstado === 'A' ? 'activar' : 'inactivar';
        this.notificationCenter.fire({ title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} estado?`, icon: 'question', showCancelButton: true, confirmButtonText: 'Sí', cancelButtonText: 'Cancelar' })
            .then((result) => { if (result.isConfirmed) { const updated = { ...item, estado: newEstado }; const request$ = newEstado === 'A' ? this.service.activateState(updated) : this.service.inactivateState(updated); request$.subscribe({ next: () => { this.notificationCenter.fire('Éxito', `Estado ${action}do correctamente`, 'success'); this.loadStates(); } }); }});
    }
}
