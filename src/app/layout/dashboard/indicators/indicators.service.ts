import { Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { DestroyRef } from '@angular/core';
import {
  IndicadorDTO,
  PeriodoDTO,
  IndicadorResultadoDTO,
  DatoTablaDTO,
} from 'app/accounting/domain/accounting.types';
import { IndicadoresService as AccountingIndicadoresService } from 'app/accounting/business/indicadores.service';
import { IndicadorKPI, DashboardItem } from './indicators.types';

@Injectable({
  providedIn: 'root'
})
export class IndicadoresService {
  private accountingService = inject(AccountingIndicadoresService);
  private destroyRef = inject(DestroyRef);

  readonly indicadores = signal<IndicadorKPI[]>([]);
  readonly loading = signal(false);
  readonly error = signal(false);

  load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.accountingService
      .getIndicadores()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map((dtos: IndicadorDTO[]) => dtos.map((dto) => this.toIndicadorKPI(dto))),
        catchError(() => {
          this.error.set(true);
          this.loading.set(false);
          return of([]);
        })
      )
      .subscribe((indicadores) => {
        this.indicadores.set(indicadores);
        this.loading.set(false);
      });
  }

  getResultado(llaveTabla: string, periodo: PeriodoDTO) {
    return this.accountingService.getResultadoIndicador(llaveTabla, periodo);
  }

  getTabla(llaveTabla: string) {
    return this.accountingService.getTablaIndicador(llaveTabla);
  }

  private toIndicadorKPI(dto: IndicadorDTO): IndicadorKPI {
    return {
      ...dto,
      acciones: [],
      periodo: { id: 0, nivel: 'full', fechaInicial: '', fechaFinal: '' },
      delta: undefined,
      badge: undefined,
      subtitulo: undefined,
      icono: dto.imagen,
    };
  }
}
