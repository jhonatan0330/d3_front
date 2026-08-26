import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { LocalStoreService } from 'app/shared/local-store.service';
import { WebServiceDTO, WebServiceFilterDTO, WebServiceEjecucionDTO, WebServiceEjecucionFilterDTO } from 'app/modules/full/neuron/model/sw42.domain';

@Injectable({
    providedIn: 'root'
})
export class WebServiceConfigService {
    private http = inject(HttpClient);
    private ls = inject(LocalStoreService);

    private baseUrl = '/api/config/web-services';

    // WebService CRUD
    getWebServices(filter?: WebServiceFilterDTO): Observable<WebServiceDTO[]> {
        const payload = {
            estado: filter?.estado || 'A',
            nombre: filter?.nombre || '',
            url: filter?.url || '',
            metodo: filter?.metodo || '',
            paginacionRegistroInicial: filter?.paginacionRegistroInicial || 0,
            paginacionRegistroFinal: filter?.paginacionRegistroFinal || 50
        };
        return this.http.post<WebServiceDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/list`, undefined),
            payload
        );
    }

    getWebServiceById(key: string): Observable<WebServiceDTO> {
        return this.http.post<WebServiceDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${key}`, undefined),
            {}
        );
    }

    createWebService(ws: WebServiceDTO): Observable<WebServiceDTO> {
        return this.http.post<WebServiceDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/create`, undefined),
            ws
        );
    }

    updateWebService(ws: WebServiceDTO): Observable<WebServiceDTO> {
        return this.http.post<WebServiceDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/update`, undefined),
            ws
        );
    }

    inactivateWebService(ws: WebServiceDTO): Observable<WebServiceDTO> {
        return this.http.post<WebServiceDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${ws.llaveTabla}/inactivate`, undefined),
            ws
        );
    }

    // Ejecución de WebService
    executeWebService(key: string, parametros: string): Observable<WebServiceEjecucionDTO> {
        return this.http.post<WebServiceEjecucionDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${key}/execute`, undefined),
            { parametros }
        );
    }

    // WebServiceEjecucion (histórico)
    getExecutions(filter?: WebServiceEjecucionFilterDTO): Observable<WebServiceEjecucionDTO[]> {
        const payload = {
            estado: filter?.estado || 'A',
            webService: filter?.webService || '',
            fechaDesde: filter?.fechaDesde,
            fechaHasta: filter?.fechaHasta,
            paginacionRegistroInicial: filter?.paginacionRegistroInicial || 0,
            paginacionRegistroFinal: filter?.paginacionRegistroFinal || 50
        };
        return this.http.post<WebServiceEjecucionDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/executions`, undefined),
            payload
        );
    }

    getExecutionsByWebService(webServiceKey: string): Observable<WebServiceEjecucionDTO[]> {
        return this.http.post<WebServiceEjecucionDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/${webServiceKey}/executions`, undefined),
            { estado: 'A' }
        );
    }
}