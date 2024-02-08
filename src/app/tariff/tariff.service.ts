import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LocalStoreService } from 'app/shared/local-store.service';
import { TarifaDTO, TarifarioDTO } from './tariff.domain';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TariffService {

  public currentTariff: TarifarioDTO;
  public currentFee: TarifaDTO;

  constructor(private http: HttpClient,
    private ls: LocalStoreService) {
  }

  getFeesFromTariff(fee:TarifaDTO): Observable<TarifaDTO[]> {
    return this.http.post<TarifaDTO[]>(
      this.ls.getUrlAccess('/tariff/fees'), fee
    );
  }
}
