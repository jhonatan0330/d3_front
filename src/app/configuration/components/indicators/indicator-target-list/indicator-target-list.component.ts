import { Component, Input, OnInit, inject, signal, computed } from '@angular/core';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { IndicatorConfigService } from 'app/configuration/configuracion.api';
import { IndicatorTargetFormComponent } from '../indicator-target-form/indicator-target-form.component';
import { IndicatorTargetDTO } from 'app/accounting/domain/IndicatorTargetDTO';
import { IndicatorTargetFilterDTO } from 'app/accounting/domain/IndicatorTargetFilterDTO';

@Component({
  selector: 'app-indicator-target-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule, MatTooltipModule, MatTableModule, DragDropModule],
  templateUrl: './indicator-target-list.component.html'
})
export class IndicatorTargetListComponent implements OnInit {
  private notificationCenter = inject(NotificationCenterService);
  private service = inject(IndicatorConfigService);
  private dialog = inject(MatDialog);

  @Input() indicatorKey!: string;
  targets = signal<IndicatorTargetDTO[]>([]);
  loading = signal(false);
  mostrarInactivos = signal(false);

  activos = computed(() => this.targets()
    .filter((target) => target.state === 'A'));
  inactivos = computed(() => this.targets().filter((t) => t.state !== 'A'));

  ngOnInit(): void {
    if (this.indicatorKey) {
      this.loadTargets();
    }
  }

  loadTargets(): void {
    this.loading.set(true);
    const filter = new IndicatorTargetFilterDTO();
    filter.indicador = this.indicatorKey;
    filter.state = '';
    this.service.getTargets(filter).subscribe({
      next: (targets) => {
        this.targets.set(targets ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notificationCenter.error('Error', 'No se pudieron cargar los targets del indicador.');
      }
    });
  }

  toggleInactivos(): void {
    this.mostrarInactivos.update((value) => !value);
  }

  openTargetForm(target?: IndicatorTargetDTO): void {
    const dialogRef = this.dialog.open(IndicatorTargetFormComponent, {
      width: '600px', maxWidth: '90vw', disableClose: true,
      data: { indicatorKey: this.indicatorKey, target, prioridad: this.activos().length + 1 }
    });
    dialogRef.afterClosed().subscribe((result: IndicatorTargetDTO) => {
      if (result) {
        this.loadTargets();
      }
    });
  }

  drop(event: CdkDragDrop<IndicatorTargetDTO[]>): void {
    if (event.previousIndex === event.currentIndex) {
      return;
    }

    const activos = [...this.activos()];
    moveItemInArray(activos, event.previousIndex, event.currentIndex);

    const reorderedTargets = [
      ...activos,
      ...this.inactivos()
    ];

    const prioridades = new Map(activos.map((target, index) => [target.key, index + 1]));

    this.targets.set(reorderedTargets.map((target) => {
      const prioridad = prioridades.get(target.key);
      return prioridad && target.state === 'A' ? { ...target, prioridad } : target;
    }));

    const movedTarget = {
      ...activos[event.currentIndex],
      prioridad: event.currentIndex + 1,
      indicador: this.indicatorKey
    };

    this.service.updateTarget(movedTarget).subscribe({
      next: () => {
        this.loadTargets();
      },
      error: () => {
        this.loadTargets();
        this.notificationCenter.error('Error', 'No se pudo guardar el orden de los targets.');
      }
    });
  }

  reactivarTarget(target: IndicatorTargetDTO): void {
    this.notificationCenter.fire({
      title: '¿Reactivar target?',
      text: `El target "${target.nombre}" volverá a estar disponible en el indicador.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, reactivar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.activateTarget({ ...target, indicador: this.indicatorKey, state: 'A' }).subscribe({
          next: () => {
            this.notificationCenter.fire('Reactivado', 'Target reactivado correctamente', 'success');
            this.loadTargets();
          }
        });
      }
    });
  }

  eliminarTarget(target: IndicatorTargetDTO): void {
    this.notificationCenter.fire({
      title: '¿Eliminar target?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.inactivateTarget({ ...target, indicador: this.indicatorKey, state: 'I' }).subscribe({
          next: () => {
            this.notificationCenter.fire('Eliminado', 'Target eliminado correctamente', 'success');
            this.loadTargets();
          }
        });
      }
    });
  }

  getTargetColorClass(color: string): string {
    const colors = [
      'bg-red-100 text-red-800',
      'bg-green-100 text-green-800',
      'bg-blue-100 text-blue-800',
      'bg-yellow-100 text-yellow-800',
      'bg-purple-100 text-purple-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
      'bg-orange-100 text-orange-800'
    ];
    const index = Math.abs(color.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % colors.length;
    return colors[index];
  }
}