import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LocalStoreService } from 'app/shared/local-store.service';
import { TarifaDTO } from './tariff.domain';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TariffService {

  public currentFee: TarifaDTO;

  constructor(private http: HttpClient,
    private ls: LocalStoreService) {
  }

  getFeesFromTariff(fee:TarifaDTO): Observable<TarifaDTO[]> {
    return this.http.post<TarifaDTO[]>(
      this.ls.getUrlAccess('/tariff/fees'), fee
    );
  }

  getFee(feeId: string): Observable<TarifaDTO> {
    return this.http.get<TarifaDTO>(
      this.ls.getUrlAccess('/tariff/fee?id=' + feeId)
    );
  }

  createFee(fee:TarifaDTO): Observable<TarifaDTO> {
    return this.http.post<TarifaDTO>(
      this.ls.getUrlAccess('/tariff/fee'), fee
    );
  }

  updateFee(fee:TarifaDTO): Observable<TarifaDTO> {
    return this.http.put<TarifaDTO>(
      this.ls.getUrlAccess('/tariff/fee'), fee
    );
  }
  
}
