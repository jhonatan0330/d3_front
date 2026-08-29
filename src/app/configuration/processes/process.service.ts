import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { LocalStoreService } from 'app/shared/local-store.service';
import { ProcesoDTO, ProcesoFilterDTO, ProcesoTransicionDTO, ProcesoTransicionFilterDTO } from 'app/document/model/sw42.domain';

@Injectable({
    providedIn: 'root'
})
export class ProcessService {
    private http = inject(HttpClient);
    private ls = inject(LocalStoreService);

    private baseUrl = '/api/config/processes';

    // Proceso CRUD
    getProcesses(filter?: ProcesoFilterDTO): Observable<ProcesoDTO[]> {
        const payload = {
            estado: filter?.estado || 'A',
            nombre: filter?.nombre || '',
            codigo: filter?.codigo || '',
            objetivo: filter?.objetivo || '',
            paginacionRegistroInicial: filter?.paginacionRegistroInicial || 0,
            paginacionRegistroFinal: filter?.paginacionRegistroFinal || 50
        };
        return this.http.post<ProcesoDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/list`, undefined),
            payload
        );
    }

    getProcessById(key: string): Observable<ProcesoDTO> {
        return this.http.post<ProcesoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${key}`, undefined),
            {}
        );
    }

    getProcessTree(): Observable<ProcesoDTO[]> {
        const payload = { estado: 'A' };
        return this.http.post<ProcesoDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/tree`, undefined),
            payload
        );
    }

    getProcessForGraph(key: string): Observable<ProcesoDTO> {
        return this.http.post<ProcesoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${key}/graph`, undefined),
            {}
        );
    }

    createProcess(process: ProcesoDTO): Observable<ProcesoDTO> {
        return this.http.post<ProcesoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/create`, undefined),
            process
        );
    }

    updateProcess(process: ProcesoDTO): Observable<ProcesoDTO> {
        return this.http.post<ProcesoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/update`, undefined),
            process
        );
    }

    inactivateProcess(process: ProcesoDTO): Observable<ProcesoDTO> {
        return this.http.post<ProcesoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${process.llaveTabla}/inactivate`, undefined),
            process
        );
    }

    // Transiciones
    getTransitions(processKey: string): Observable<ProcesoTransicionDTO[]> {
        const payload = { estado: 'A', proceso: processKey };
        return this.http.post<ProcesoTransicionDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/${processKey}/transitions`, undefined),
            payload
        );
    }

    getTransitionById(key: string): Observable<ProcesoTransicionDTO> {
        return this.http.post<ProcesoTransicionDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/transitions/${key}`, undefined),
            {}
        );
    }

    createTransition(transition: ProcesoTransicionDTO): Observable<ProcesoTransicionDTO> {
        return this.http.post<ProcesoTransicionDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/transitions`, undefined),
            transition
        );
    }

    updateTransition(transition: ProcesoTransicionDTO): Observable<ProcesoTransicionDTO> {
        return this.http.post<ProcesoTransicionDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/transitions/${transition.llaveTabla}`, undefined),
            transition
        );
    }

    inactivateTransition(transition: ProcesoTransicionDTO): Observable<ProcesoTransicionDTO> {
        return this.http.post<ProcesoTransicionDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/transitions/${transition.llaveTabla}/inactivate`, undefined),
            transition
        );
    }
}