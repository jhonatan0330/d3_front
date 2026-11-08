import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AccountingService } from 'app/accounting/accounting.api';
import {
  DatoTablaDTO,
  Indicador,
  IndicadorDTO,
  IndicadorResultadoDTO,
} from 'app/accounting/domain/IndicadorDTO';
import { PeriodoDTO } from 'app/accounting/domain/PeriodoDTO';

@Injectable({ providedIn: 'root' })
export class IndicadoresService {
  private accountingService = inject(AccountingService);

  getIndicadores(): Observable<IndicadorDTO[]> {
    return this.accountingService.getIndicadoresMock();
  }

  getResultadoIndicador(llaveTabla: string, period: PeriodoDTO): Observable<IndicadorResultadoDTO> {
    return this.accountingService.getIndicadorMock(llaveTabla).pipe(
      map((indicador) => {
        const dato = indicador.datos?.find((item) => item.account === llaveTabla || item.catalog === llaveTabla) ?? indicador.datos?.[0];
        const valor = Number(dato?.value ?? 0);
        return {
          valor,
          valor_antes: 0,
          valor_despues: valor,
          fecha: period?.startDate ?? indicador.periodo?.startDate,
          key: llaveTabla,
        };
      })
    );
  }

  getTablaIndicador(llaveTabla: string): Observable<DatoTablaDTO[]> {
    return this.accountingService.getIndicadorMock(llaveTabla).pipe(
      map((indicador) => {
        if (indicador.llaveTabla === llaveTabla) {
          return indicador.datos ?? [];
        }
        return [];
      })
    );
  }

  toIndicador(dto: IndicadorDTO): Indicador {
    return {
      ...dto,
      propiedades: dto.propiedades ?? [],
      metricas: dto.metricas ?? [],
      datos: dto.datos ?? [],
    };
  }
}
