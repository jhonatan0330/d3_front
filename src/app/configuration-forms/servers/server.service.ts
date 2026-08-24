import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { LocalStoreService } from 'app/shared/local-store.service';
import { ServidorDTO, ServidorFilterDTO } from 'app/modules/full/neuron/model/sw42.domain';

@Injectable({
    providedIn: 'root'
})
export class ServerService {
    private http = inject(HttpClient);
    private ls = inject(LocalStoreService);

    private baseUrl = '/api/config/servers';

    getServidores(filter?: ServidorFilterDTO): Observable<ServidorDTO[]> {
        const payload = {
            estado: filter?.estado || 'A',
            nombre: filter?.nombre || '',
            tipo: filter?.tipo || '',
            activo: filter?.activo,
            paginacionRegistroInicial: filter?.paginacionRegistroInicial || 0,
            paginacionRegistroFinal: filter?.paginacionRegistroFinal || 50
        };
        return this.http.post<ServidorDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/list`, undefined),
            payload
        );
    }

    getServidorById(key: string): Observable<ServidorDTO> {
        return this.http.post<ServidorDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${key}`, undefined),
            {}
        );
    }

    createServidor(server: ServidorDTO): Observable<ServidorDTO> {
        return this.http.post<ServidorDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/create`, undefined),
            server
        );
    }

    updateServidor(server: ServidorDTO): Observable<ServidorDTO> {
        return this.http.post<ServidorDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/update`, undefined),
            server
        );
    }

    inactivateServidor(server: ServidorDTO): Observable<ServidorDTO> {
        return this.http.post<ServidorDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${server.llaveTabla}/inactivate`, undefined),
            server
        );
    }
}