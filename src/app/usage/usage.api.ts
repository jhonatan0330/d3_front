import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { LocalStoreService } from 'app/shared/local-store.service';
import { MovimientoConsumoDTO, MovimientoConsumoFilterDTO, SaldoConsumoDTO } from 'app/usage/domain/usage.domain';

@Injectable({
    providedIn: 'root'
})
export class UsageApi {
    private http = inject(HttpClient);
    private ls = inject(LocalStoreService);

    balance(): Observable<SaldoConsumoDTO> {
        return this.http.post<SaldoConsumoDTO>(
            this.ls.getUrlAccess('/usage/balance'), {}
        );
    }

    movements(filter?: MovimientoConsumoFilterDTO): Observable<MovimientoConsumoDTO[]> {
        return this.http.post<MovimientoConsumoDTO[]>(
            this.ls.getUrlAccess('/usage/movements'), filter ?? {}
        );
    }
}
