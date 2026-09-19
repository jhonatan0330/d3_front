import { Component, OnInit, inject } from '@angular/core';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { IndicatorDTO } from 'app/configuration/domain/configuration.types';
import { IndicatorConfigService } from 'app/configuration/configuracion.api';
import { ImageUploaderComponent } from 'app/upload/components/image-uploader/image-uploader.component';
import { ProcessSelectorComponent } from '../../shared/process-selector/process-selector.component';
import { PropertyPanelComponent } from '../../shared/property-panel/property-panel.component';

@Component({
  selector: 'app-indicator-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule, ImageUploaderComponent, ProcessSelectorComponent],
  templateUrl: './indicator-form.component.html',
})
export class IndicatorFormComponent implements OnInit {
  private notificationCenter = inject(NotificationCenterService);
  public dialogRef = inject<MatDialogRef<IndicatorFormComponent>>(MatDialogRef);
  public data = inject<IndicatorDTO | null>(MAT_DIALOG_DATA);
  private dialog = inject(MatDialog);
  private service = inject(IndicatorConfigService);

  indicador: IndicatorDTO = new IndicatorDTO();
  cargando = false;

  ngOnInit(): void {
    if (this.data) {
      this.indicador = { ...this.data, propiedades: this.data.propiedades || [] };
    } else {
      this.indicador = new IndicatorDTO();
      this.indicador.estado = 'A';
      this.indicador.propiedades = [];
    }
  }

  openPropiedades(): void {
    if (!this.indicador.llaveTabla) return;
    this.dialog.open(PropertyPanelComponent, {
      width: '800px', maxWidth: '95vw', maxHeight: '90vh', disableClose: true,
      data: { campoKey: this.indicador.llaveTabla, tipoOrigen: 'I', titulo: this.indicador.nombre }
    });
  }

  onSubmit(): void {
    this.cargando = true;
    const request = this.indicador.llaveTabla
      ? this.service.updateIndicador(this.indicador)
      : this.service.createIndicador(this.indicador);
    request.subscribe({
      next: (res) => {
        this.cargando = false;
        this.notificationCenter.fire('Éxito', this.indicador.llaveTabla ? 'Indicador actualizado correctamente' : 'Indicador creado correctamente', 'success');
        this.dialogRef.close(res);
      },
      error: () => {
        this.cargando = false;
        this.notificationCenter.fire('Error', 'No se pudo guardar el indicador', 'error');
      },
    });
  }
}
