import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AccountingService } from 'app/accounting/accounting.api';
import { IndicatorDTO } from 'app/accounting/domain/IndicatorDTO';
import { ResultMapDTO } from 'app/accounting/domain/ResultMapDTO';

@Injectable({ providedIn: 'root' })
export class IndicadoresService {
  private accountingService = inject(AccountingService);

  getIndicadores(): Observable<IndicatorDTO[]> {
    return this.accountingService.getIndicadores();
  }

  getResultadoIndicador(llaveTabla: string, period: string): Observable<ResultMapDTO> {
    return this.accountingService.getResultadoIndicador(llaveTabla, period).pipe(
      map((resultado) => ({
        ...resultado,
        key: llaveTabla,
        quantity: resultado?.quantity ?? 0,
        lastBalance: resultado?.lastBalance ??0,
        nextBalance: resultado?.nextBalance ?? 0,
        positive: resultado?.positive ?? 0,
        negative: resultado?.negative ?? 0,
        value: resultado?.value ?? 0,
      }))
    );
  }

  getTablaIndicador(llaveTabla: string): Observable<ResultMapDTO[]> {
    return this.accountingService.getTablaIndicador(llaveTabla);
  }
}
