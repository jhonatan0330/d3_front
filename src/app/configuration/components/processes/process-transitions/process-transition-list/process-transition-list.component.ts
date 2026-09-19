import { Component, Input, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ProcesoDTO, ProcesoTransicionDTO, ProcesoTransicionFilterDTO } from 'app/document/document.types';
import { ProcessService } from 'app/configuration/configuracion.api';
import { ProcessTransitionFormComponent } from '../process-transition-form/process-transition-form.component';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';

@Component({
    selector: 'app-process-transition-list',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule, MatTableModule, MatInputModule, MatFormFieldModule],
    templateUrl: './process-transition-list.component.html',
})
export class ProcessTransitionListComponent implements OnInit {
    private notificationCenter = inject(NotificationCenterService);
    private service = inject(ProcessService);
    private dialog = inject(MatDialog);

    @Input() processKey!: string;
    @Input() process!: ProcesoDTO;
    @Output() transitionSaved = new EventEmitter<ProcesoTransicionDTO>();

    transitions = signal<ProcesoTransicionDTO[]>([]);
    loading = signal(false);

    displayedColumns = ['nombre', 'estadoPartida', 'estadoLlegada', 'plantilla', 'documentador', 'afectaSaldo', 'rapida', 'estado', 'acciones'];

    ngOnInit(): void {
        if (this.processKey) {
            this.loadTransitions();
        }
    }

    loadTransitions(): void {
        this.loading.set(true);
        this.service.getTransitions(this.processKey).subscribe({
            next: (res) => { this.transitions.set(res); this.loading.set(false); },
            error: () => this.loading.set(false)
        });
    }

    openTransitionForm(transition?: ProcesoTransicionDTO): void {
        const dialogRef = this.dialog.open(ProcessTransitionFormComponent, {
            width: '700px', maxWidth: '90vw', disableClose: true,
            data: { transition: transition ? { ...transition } : null, process: this.process }
        });
        dialogRef.afterClosed().subscribe((result: ProcesoTransicionDTO) => {
            if (result) {
                this.transitionSaved.emit(result);
                this.loadTransitions();
            }
        });
    }

    toggleStatus(item: ProcesoTransicionDTO): void {
        const newEstado = item.estado === 'A' ? 'I' : 'A';
        const action = newEstado === 'A' ? 'activar' : 'inactivar';
        this.notificationCenter.fire({ title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} transición?`, icon: 'question', showCancelButton: true, confirmButtonText: 'Sí', cancelButtonText: 'Cancelar' })
            .then((result) => { if (result.isConfirmed) { const updated = { ...item, estado: newEstado }; this.service.inactivateTransition(updated).subscribe({ next: () => { this.notificationCenter.fire('Éxito', `Transición ${action}da correctamente`, 'success'); this.loadTransitions(); }, error: () => this.notificationCenter.fire('Error', `No se pudo ${action} la transición`, 'error') }); }});
    }
}
