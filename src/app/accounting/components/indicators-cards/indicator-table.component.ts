import { DecimalPipe } from '@angular/common';
import { Component,  inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  DatoTablaDTO,
  IndicadorDTO,
} from 'app/accounting/domain/IndicadorDTO';
import { ImageFormatPipe } from 'app/shared/local-image';

interface IndicatorTableData {
  indicador: IndicadorDTO;
}

@Component({
  selector: 'indicator-table',
  imports: [DecimalPipe, ImageFormatPipe],
  templateUrl: './indicator-table.component.html',
})
export class IndicatorTableComponent {
  private dialogRef = inject<MatDialogRef<IndicatorTableComponent>>(MatDialogRef);
 // private indicadoresService = inject(IndicadoresService);
  data = inject<IndicatorTableData>(MAT_DIALOG_DATA);

  protected indicador = this.data.indicador;
  protected tabla = signal<DatoTablaDTO[]>([]);
  protected loading = signal(false);

  constructor() {
    this.loading.set(true);
   /* this.indicadoresService
      .getTablaIndicador(this.indicador.llaveTabla)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (tabla) => {
          this.tabla.set(tabla);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });*/
  }

  protected close(): void {
    this.dialogRef.close();
  }

  protected onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/icons/icon-192x192.png';
  }
}
