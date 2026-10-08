import { Component, Input, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ProcesoDTO, ProcesoEstadoDTO } from 'app/document/document.types';
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

@Component({
    selector: 'app-process-state-list',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule, MatTableModule, MatInputModule, MatFormFieldModule],
    templateUrl: './process-state-list.component.html',
})
export class ProcessStateListComponent implements OnInit {
    private notificationCenter = inject(NotificationCenterService);
    private service = inject(ProcessService);
    private dialog = inject(MatDialog);

    @Input() processKey!: string;
    @Input() process!: ProcesoDTO;
    @Output() stateSaved = new EventEmitter<ProcesoEstadoDTO>();

    states = signal<ProcesoEstadoDTO[]>([]);
    loading = signal(false);

    displayedColumns = ['nombre', 'tipo', 'codigo', 'avance', 'estadoDocumento', 'estado', 'acciones'];

    ngOnInit(): void {
        if (this.processKey) {
            this.loadStates();
        }
    }

    loadStates(): void {
        this.loading.set(true);
        this.service.getStates(this.processKey).subscribe({
            next: (res) => { this.states.set(res); this.loading.set(false); },
            error: () => this.loading.set(false)
        });
    }

    tipoLabel(tipo: string): string {
        return PROCESO_ESTADO_TIPO_LABELS[tipo] || tipo || '-';
    }

    estadoDocumentoLabel(estadoDocumento: string): string {
        return PROCESO_ESTADO_DOCUMENTO_LABELS[estadoDocumento] || estadoDocumento || '-';
    }

    openStateForm(state?: ProcesoEstadoDTO): void {
        const dialogRef = this.dialog.open(ProcessStateFormComponent, {
            width: '700px', maxWidth: '90vw', disableClose: true,
            data: { state: state ? { ...state } : null, process: this.process }
        });
        dialogRef.afterClosed().subscribe((result: ProcesoEstadoDTO) => {
            if (result) {
                this.stateSaved.emit(result);
                this.loadStates();
            }
        });
    }

    toggleStatus(item: ProcesoEstadoDTO): void {
        const newEstado = item.estado === 'A' ? 'I' : 'A';
        const action = newEstado === 'A' ? 'activar' : 'inactivar';
        this.notificationCenter.fire({ title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} estado?`, icon: 'question', showCancelButton: true, confirmButtonText: 'Sí', cancelButtonText: 'Cancelar' })
            .then((result) => { if (result.isConfirmed) { const updated = { ...item, estado: newEstado }; this.service.inactivateState(updated).subscribe({ next: () => { this.notificationCenter.fire('Éxito', `Estado ${action}do correctamente`, 'success'); this.loadStates(); } }); }});
    }
}
