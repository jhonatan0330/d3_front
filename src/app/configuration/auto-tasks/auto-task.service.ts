import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { LocalStoreService } from 'app/shared/local-store.service';
import { ProcesoTransicionAutomaticaDTO, ProcesoTransicionAutomaticaFilterDTO } from 'app/document/model/sw42.domain';

@Injectable({
    providedIn: 'root'
})
export class AutoTaskService {
    private http = inject(HttpClient);
    private ls = inject(LocalStoreService);

    private baseUrl = '/api/config/auto-tasks';

    getAutoTasks(filter?: ProcesoTransicionAutomaticaFilterDTO): Observable<ProcesoTransicionAutomaticaDTO[]> {
        const payload = {
            estado: filter?.estado || 'A',
            proceso: filter?.proceso || '',
            estadoOrigen: filter?.estadoOrigen || '',
            estadoDestino: filter?.estadoDestino || '',
            activa: filter?.activa,
            fechaDesde: filter?.fechaDesde,
            fechaHasta: filter?.fechaHasta,
            paginacionRegistroInicial: filter?.paginacionRegistroInicial || 0,
            paginacionRegistroFinal: filter?.paginacionRegistroFinal || 50
        };
        return this.http.post<ProcesoTransicionAutomaticaDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/list`, undefined),
            payload
        );
    }

    getAutoTaskById(key: string): Observable<ProcesoTransicionAutomaticaDTO> {
        return this.http.post<ProcesoTransicionAutomaticaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${key}`, undefined),
            {}
        );
    }

    createAutoTask(task: ProcesoTransicionAutomaticaDTO): Observable<ProcesoTransicionAutomaticaDTO> {
        return this.http.post<ProcesoTransicionAutomaticaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/create`, undefined),
            task
        );
    }

    updateAutoTask(task: ProcesoTransicionAutomaticaDTO): Observable<ProcesoTransicionAutomaticaDTO> {
        return this.http.post<ProcesoTransicionAutomaticaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/update`, undefined),
            task
        );
    }

    inactivateAutoTask(task: ProcesoTransicionAutomaticaDTO): Observable<ProcesoTransicionAutomaticaDTO> {
        return this.http.post<ProcesoTransicionAutomaticaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${task.llaveTabla}/inactivate`, undefined),
            task
        );
    }

    scheduleAutoTask(key: string, programacion: { tipo: string; cron?: string; fecha?: Date }): Observable<ProcesoTransicionAutomaticaDTO> {
        return this.http.post<ProcesoTransicionAutomaticaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${key}/schedule`, undefined),
            programacion
        );
    }

    executeAutoTask(key: string): Observable<ProcesoTransicionAutomaticaDTO> {
        return this.http.post<ProcesoTransicionAutomaticaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${key}/execute`, undefined),
            {}
        );
    }
}