import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AccountingService } from 'app/accounting/accounting.api';
import { IndicatorDTO } from 'app/accounting/domain/IndicatorDTO';
import { TimeFrame } from 'app/accounting/domain/TimeFrame';
import { ResultMapDTO } from 'app/accounting/domain/ResultMapDTO';

@Injectable({ providedIn: 'root' })
export class IndicadoresService {
  private accountingService = inject(AccountingService);

  getIndicadores(): Observable<IndicatorDTO[]> {
    return this.accountingService.getIndicadores();
  }

  getResultadoIndicador(llaveTabla: string, period: TimeFrame): Observable<ResultMapDTO> {
    return this.accountingService.getResultadoIndicador(llaveTabla, period).pipe(
      map((resultado) => ({
        ...resultado,
        key: llaveTabla,
      }))
    );
  }

  getTablaIndicador(llaveTabla: string): Observable<ResultMapDTO[]> {
    return this.accountingService.getTablaIndicador(llaveTabla);
  }
}
