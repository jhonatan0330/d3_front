import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LocalStoreService } from 'app/shared/local-store.service';
import { TarifaDTO, TariffOptionDTO } from './tariff.domain';
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

  getDimensionToTariff(tariffId: string, dimension: string, filter: string): Observable<TariffOptionDTO[]> {
    return this.http.get<TariffOptionDTO[]>(
      this.ls.getUrlAccess('/tariff/dimension?tariff=' + tariffId + '&dimension='+ dimension + "&filter=" + filter)
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

  deleteFee(feeId: string): Observable<void> {
    return this.http.delete<void>(
      this.ls.getUrlAccess('/tariff/fee?id=' + feeId)
    );
  }

}
