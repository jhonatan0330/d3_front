import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { LocalStoreService } from 'app/shared/local-store.service';
import { ConsecutivoDTO, ConsecutivoFilterDTO } from 'app/document/model/sw42.domain';

@Injectable({
    providedIn: 'root'
})
export class ConsecutiveService {
    private http = inject(HttpClient);
    private ls = inject(LocalStoreService);

    private baseUrl = '/api/config/consecutives';

    getConsecutivos(filter?: ConsecutivoFilterDTO): Observable<ConsecutivoDTO[]> {
        const payload = {
            estado: filter?.estado || 'A',
            nombre: filter?.nombre || '',
            prefijo: filter?.prefijo || '',
            paginacionRegistroInicial: filter?.paginacionRegistroInicial || 0,
            paginacionRegistroFinal: filter?.paginacionRegistroFinal || 50
        };
        return this.http.post<ConsecutivoDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/list`, undefined),
            payload
        );
    }

    getConsecutivoById(key: string): Observable<ConsecutivoDTO> {
        return this.http.post<ConsecutivoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${key}`, undefined),
            {}
        );
    }

    createConsecutivo(consecutivo: ConsecutivoDTO): Observable<ConsecutivoDTO> {
        return this.http.post<ConsecutivoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/create`, undefined),
            consecutivo
        );
    }

    updateConsecutivo(consecutivo: ConsecutivoDTO): Observable<ConsecutivoDTO> {
        return this.http.post<ConsecutivoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/update`, undefined),
            consecutivo
        );
    }

    inactivateConsecutivo(consecutivo: ConsecutivoDTO): Observable<ConsecutivoDTO> {
        return this.http.post<ConsecutivoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${consecutivo.llaveTabla}/inactivate`, undefined),
            consecutivo
        );
    }

    assignConsecutivo(consecutivo: ConsecutivoDTO): Observable<ConsecutivoDTO> {
        return this.http.post<ConsecutivoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${consecutivo.llaveTabla}/assign`, undefined),
            consecutivo
        );
    }
}