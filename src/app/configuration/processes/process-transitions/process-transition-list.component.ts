import { Component, Input, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ProcesoDTO, ProcesoTransicionDTO, ProcesoTransicionFilterDTO } from 'app/document/model/sw42.domain';
import { ProcessService } from '../process.service';
import { ProcessTransitionFormComponent } from './process-transition-form.component';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-process-transition-list',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule, MatTableModule, MatPaginatorModule, MatInputModule, MatFormFieldModule],
    template: `
    <div class="flex flex-col h-full">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold">Transiciones del Proceso</h3>
        <button type="button" class="btn-flat-primary" (click)="openTransitionForm()"><mat-icon>add</mat-icon> Nueva Transición</button>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-12"><div class="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden"><div class="h-full bg-primary rounded animate-pulse" style="width: 40%;"></div></div></div>
      } @else if (transitions().length === 0) {
        <div class="flex-1 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
          <mat-icon class="text-6xl mb-4">swap_horiz</mat-icon>
          <p class="text-lg">No hay transiciones configuradas</p>
          <button type="button" class="btn-flat-primary mt-4" (click)="openTransitionForm()"><mat-icon>add</mat-icon> Crear primera transición</button>
        </div>
      } @else {
        <div class="flex-1 overflow-y-auto">
          <div class="overflow-x-auto">
            <table mat-table [dataSource]="transitions()" class="w-full">
              <ng-container matColumnDef="nombre"><th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Nombre</th><td mat-cell *matCellDef="let element" class="px-4 py-3 font-medium">{{ element.nombre }}</td></ng-container>
              <ng-container matColumnDef="estadoPartida"><th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Estado Origen</th><td mat-cell *matCellDef="let element" class="px-4 py-3">{{ element.estadoPartidaNombre }}</td></ng-container>
              <ng-container matColumnDef="estadoLlegada"><th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Estado Destino</th><td mat-cell *matCellDef="let element" class="px-4 py-3">{{ element.estadoLlegadaNombre }}</td></ng-container>
              <ng-container matColumnDef="plantilla"><th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Plantilla</th><td mat-cell *matCellDef="let element" class="px-4 py-3">{{ element.plantillaNombre }}</td></ng-container>
              <ng-container matColumnDef="documentador"><th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Documentador</th><td mat-cell *matCellDef="let element" class="px-4 py-3 text-center"><span class="badge" [class.badge-success]="element.documentador" [class.badge-secondary]="!element.documentador">{{ element.documentador ? 'Sí' : 'No' }}</span></td></ng-container>
              <ng-container matColumnDef="afectaSaldo"><th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Afecta Saldo</th><td mat-cell *matCellDef="let element" class="px-4 py-3">{{ element.afectaSaldo }}</td></ng-container>
              <ng-container matColumnDef="rapida"><th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Rápida</th><td mat-cell *matCellDef="let element" class="px-4 py-3 text-center"><span class="badge" [class.badge-info]="element.rapida" [class.badge-secondary]="!element.rapida">{{ element.rapida ? 'Sí' : 'No' }}</span></td></ng-container>
              <ng-container matColumnDef="estado"><th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Estado</th><td mat-cell *matCellDef="let element" class="px-4 py-3"><span class="badge" [class.badge-success]="element.estado === 'A'" [class.badge-secondary]="element.estado === 'I'">{{ element.estado === 'A' ? 'Activo' : 'Inactivo' }}</span></td></ng-container>
              <ng-container matColumnDef="acciones"><th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Acciones</th><td mat-cell *matCellDef="let element" class="px-4 py-3"><div class="flex items-center justify-end gap-1"><button type="button" class="btn-icon btn-flat-primary" (click)="openTransitionForm(element)" aria-label="Editar"><mat-icon>edit</mat-icon></button><button type="button" class="btn-icon btn-flat-accent" (click)="toggleStatus(element)" aria-label="{{ element.estado === 'A' ? 'Inactivar' : 'Activar' }}"><mat-icon>{{ element.estado === 'A' ? 'block' : 'check_circle' }}</mat-icon></button></div></td></ng-container>
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr><tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>
        </div>
      }
    </div>
  `,
    styles: []
})
export class ProcessTransitionListComponent implements OnInit {
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
            width: '700px', maxWidth: '90vw',
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
        Swal.fire({ title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} transición?`, icon: 'question', showCancelButton: true, confirmButtonText: 'Sí', cancelButtonText: 'Cancelar' })
            .then((result) => { if (result.isConfirmed) { const updated = { ...item, estado: newEstado }; this.service.inactivateTransition(updated).subscribe({ next: () => { Swal.fire('Éxito', `Transición ${action}da correctamente`, 'success'); this.loadTransitions(); }, error: () => Swal.fire('Error', `No se pudo ${action} la transición`, 'error') }); }});
    }
}