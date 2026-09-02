import { DecimalPipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  DatoTabla,
  Indicador,
  IndicadoresService,
} from 'app/layout/dashboard/indicadores.service';

interface IndicatorTableData {
  indicador: Indicador;
}

@Component({
  selector: 'indicator-table',
  imports: [DecimalPipe],
  template: `
    <div class="flex w-[min(90vw,48rem)] flex-col gap-4 p-6">
      <!-- Header -->
      <div class="flex items-center justify-between gap-x-3">
        <div class="flex min-w-0 items-center gap-x-3">
          <span
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-100 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800"
          >
            <img
              class="h-5 w-5 object-contain"
              [src]="indicador.icono"
              alt=""
              (error)="onImageError($event)"
            />
          </span>
          <div class="min-w-0">
            <div
              class="truncate text-base font-semibold tracking-tight text-neutral-900 dark:text-white"
            >
              {{ indicador.nombre }}
            </div>
            <div class="text-xs text-neutral-500 dark:text-neutral-400">
              Tabla de datos del indicador
            </div>
          </div>
        </div>
        <button
          class="rounded-lg border border-neutral-200 bg-white p-2 text-neutral-500 shadow-sm transition-colors hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-600 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
          aria-label="Cerrar"
          (click)="close()"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      @if (loading()) {
        <div
          class="h-40 w-full animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800"
        ></div>
      } @else {
        <div
          class="max-h-[60vh] overflow-auto rounded-lg border border-neutral-100 dark:border-neutral-800"
        >
          <table class="w-full text-sm">
            <thead class="sticky top-0">
              <tr
                class="border-b border-neutral-100 bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-400"
              >
                <th class="px-3 py-2 font-semibold">Fecha</th>
                <th class="px-3 py-2 font-semibold">Descripción</th>
                <th class="px-3 py-2 text-right font-semibold">Valor</th>
              </tr>
            </thead>
            <tbody>
              @for (fila of tabla(); track fila.id) {
                <tr class="border-b border-neutral-50 last:border-0 dark:border-neutral-800">
                  <td class="px-3 py-2 text-neutral-600 dark:text-neutral-300">
                    {{ fila.fecha }}
                  </td>
                  <td class="px-3 py-2 text-neutral-600 dark:text-neutral-300">
                    {{ fila.descripcion }}
                  </td>
                  <td
                    class="px-3 py-2 text-right font-medium text-neutral-900 dark:text-white"
                  >
                    {{ fila.valor | number }}
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td
                    colspan="3"
                    class="px-3 py-4 text-center text-neutral-400 dark:text-neutral-500"
                  >
                    Sin datos
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class IndicatorTableComponent {
  private dialogRef = inject<MatDialogRef<IndicatorTableComponent>>(MatDialogRef);
  private destroyRef = inject(DestroyRef);
  private indicadoresService = inject(IndicadoresService);
  data = inject<IndicatorTableData>(MAT_DIALOG_DATA);

  protected indicador = this.data.indicador;
  protected tabla = signal<DatoTabla[]>([]);
  protected loading = signal(false);

  constructor() {
    this.loading.set(true);
    this.indicadoresService
      .getTablaIndicador(this.indicador.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (tabla) => {
          this.tabla.set(tabla);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  protected close(): void {
    this.dialogRef.close();
  }

  protected onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/icons/icon-192x192.png';
  }
}