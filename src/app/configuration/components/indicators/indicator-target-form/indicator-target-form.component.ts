import { Component, inject, OnInit } from '@angular/core';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { IndicatorTargetDTO } from 'app/accounting/domain/IndicatorTargetDTO';
import { IndicatorConfigService } from 'app/configuration/configuracion.api';

@Component({
  selector: 'app-indicator-target-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule],
  templateUrl: './indicator-target-form.component.html'
})
export class IndicatorTargetFormComponent implements OnInit {
  private notificationCenter = inject(NotificationCenterService);
  public dialogRef = inject<MatDialogRef<IndicatorTargetFormComponent>>(MatDialogRef);
  public data = inject<{ indicatorKey: string, target?: IndicatorTargetDTO, prioridad?: number }>(MAT_DIALOG_DATA);

  private service = inject(IndicatorConfigService);

  target: IndicatorTargetDTO = {
    nombre: '',
    valorInferior: null,
    valorSuperior: null,
    color: '#64748b'
  };
  cargando = false;
  titulo = 'Nuevo Target';

  ngOnInit(): void {
    if (this.data?.target) {
      this.target = { ...this.data.target };
      this.titulo = 'Editar Target';
    } else {
      this.target = {
        nombre: '',
        valorInferior: null,
        valorSuperior: null,
        color: '#64748b',
        state: 'A',
        indicador: this.data.indicatorKey,
        prioridad: this.data.prioridad ?? 1
      };
    }
  }

  onSubmit(): void {
    this.cargando = true;
    const target = { ...this.target, indicador: this.data.indicatorKey };
    const request$ = target.key
      ? this.service.updateTarget(target)
      : this.service.createTarget(target);

    request$.subscribe({
      next: (result) => {
        this.cargando = false;
        this.notificationCenter.fire('Éxito', 'Target guardado correctamente', 'success');
        this.dialogRef.close(result);
      },
      error: () => {
        this.cargando = false;
        this.notificationCenter.error('Error', 'No se pudo guardar el target.');
      }
    });
  }
}