import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { LocalStoreService } from 'app/shared/local-store.service';
import { TenantPublicDTO } from 'app/multitenancy/domain/multitenancy.types';

@Injectable({
    providedIn: 'root',
})
export class MultitenancyApi {
    private http = inject(HttpClient);
    private ls = inject(LocalStoreService);

    listarTenants(): Observable<TenantPublicDTO[]> {
        return this.http.get<TenantPublicDTO[]>(
            this.ls.getUrlAccess('/multi-tenancy')
        );
    }
}