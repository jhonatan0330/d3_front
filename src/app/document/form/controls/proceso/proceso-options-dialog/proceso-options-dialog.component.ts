import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { PedidoVentaDTO } from 'app/document/document.types';
import { ImageFormatPipe } from 'app/shared/local-image';

export interface ProcesoOptionsDialogData {
  title: string;
  options: PedidoVentaDTO[];
}

@Component({
  selector: 'app-proceso-options-dialog',
  standalone: true,
  imports: [DecimalPipe, TitleCasePipe, FormsModule, MatDialogModule, MatIcon, MatFormField, MatLabel, MatInput, ImageFormatPipe],
  templateUrl: './proceso-options-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.Eager
})
export class ProcesoOptionsDialogComponent implements AfterViewInit {
  readonly dialogRef = inject(MatDialogRef<ProcesoOptionsDialogComponent>);
  readonly data = inject<ProcesoOptionsDialogData>(MAT_DIALOG_DATA);
  readonly filterText = signal('');
  readonly filterInput = viewChild<ElementRef<HTMLInputElement>>('filterInput');

  ngAfterViewInit(): void {
    queueMicrotask(() => this.filterInput()?.nativeElement.focus());
  }

  get filteredOptions(): PedidoVentaDTO[] {
    const filterValue = this.normalize(this.filterText());
    if (!filterValue) {
      return this.data.options;
    }

    return this.data.options.filter((document) =>
      this.normalize(document.descripcion || document.nombre).includes(filterValue)
      || this.normalize(document.nombre).includes(filterValue)
      || !!document.caracteristicas?.some((characteristic) =>
        this.normalize(characteristic.valorText || '').includes(filterValue)
      )
    );
  }

  updateFilter(value: string): void {
    this.filterText.set(value);
  }

  private normalize(value: string): string {
    return (value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  select(document: PedidoVentaDTO): void {
    this.dialogRef.close(document);
  }
}
