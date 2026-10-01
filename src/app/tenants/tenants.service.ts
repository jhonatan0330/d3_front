import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { LocalStoreService } from 'app/shared/local-store.service';
import { MovimientoConsumoDTO, MovimientoConsumoFilterDTO, SaldoConsumoDTO, TenantDTO, TenantUsuarioDTO, TransferenciaConsumoDTO } from 'app/tenants/tenants.types';

@Injectable({
    providedIn: 'root',
})
export class TenantsService {
    private http = inject(HttpClient);
    private ls = inject(LocalStoreService);

    misSubtenants(): Observable<TenantDTO[]> {
        return this.http.get<TenantDTO[]>(this.ls.getUrlAccess('/multi-tenancy/mis-subtenants'));
    }

    detalleTenant(key: string): Observable<TenantDTO> {
        return this.http.get<TenantDTO>(this.ls.getUrlAccess('/multi-tenancy/' + key));
    }

    actualizarTenant(key: string, cambios: Partial<TenantDTO>): Observable<TenantDTO> {
        return this.http.put<TenantDTO>(this.ls.getUrlAccess('/multi-tenancy/' + key), cambios);
    }

    listarUsuarios(key: string): Observable<TenantUsuarioDTO[]> {
        return this.http.get<TenantUsuarioDTO[]>(this.ls.getUrlAccess('/multi-tenancy/' + key + '/usuarios'));
    }

    asignarUsuario(key: string, usuario: string): Observable<TenantUsuarioDTO> {
        return this.http.post<TenantUsuarioDTO>(this.ls.getUrlAccess('/multi-tenancy/' + key + '/usuarios'), { usuario });
    }

    retirarUsuario(key: string, usuarioId: string): Observable<TenantUsuarioDTO> {
        return this.http.delete<TenantUsuarioDTO>(this.ls.getUrlAccess('/multi-tenancy/' + key + '/usuarios/' + usuarioId));
    }

    balance(): Observable<SaldoConsumoDTO> {
        return this.http.post<SaldoConsumoDTO>(this.ls.getUrlAccess('/usage/balance'), {});
    }

    movements(filter?: MovimientoConsumoFilterDTO): Observable<MovimientoConsumoDTO[]> {
        return this.http.post<MovimientoConsumoDTO[]>(this.ls.getUrlAccess('/usage/movements'), filter ?? {});
    }

    transferir(dto: TransferenciaConsumoDTO): Observable<MovimientoConsumoDTO> {
        return this.http.post<MovimientoConsumoDTO>(this.ls.getUrlAccess('/usage/transfer'), dto);
    }

    balanceHijo(tenantKey: string): Observable<SaldoConsumoDTO> {
        return this.http.post<SaldoConsumoDTO>(this.ls.getUrlAccess('/usage/balance-hijo'), { tenantKey });
    }

    movementsHijo(tenantKey: string, filter?: MovimientoConsumoFilterDTO): Observable<MovimientoConsumoDTO[]> {
        return this.http.post<MovimientoConsumoDTO[]>(this.ls.getUrlAccess('/usage/movements-hijo'), { tenantKey, filter: filter ?? {} });
    }
}
