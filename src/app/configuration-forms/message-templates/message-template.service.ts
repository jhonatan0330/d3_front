import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { LocalStoreService } from 'app/shared/local-store.service';
import { MensajePlantillaCorreoDTO, MensajePlantillaCorreoFilterDTO } from 'app/modules/full/neuron/model/sw42.domain';

@Injectable({
    providedIn: 'root'
})
export class MessageTemplateService {
    private http = inject(HttpClient);
    private ls = inject(LocalStoreService);

    private baseUrl = '/api/config/message-templates';

    getTemplates(filter?: MensajePlantillaCorreoFilterDTO): Observable<MensajePlantillaCorreoDTO[]> {
        const payload = {
            estado: filter?.estado || 'A',
            nombre: filter?.nombre || '',
            tipo: filter?.tipo || '',
            paginacionRegistroInicial: filter?.paginacionRegistroInicial || 0,
            paginacionRegistroFinal: filter?.paginacionRegistroFinal || 50
        };
        return this.http.post<MensajePlantillaCorreoDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/list`, undefined),
            payload
        );
    }

    getTemplateById(key: string): Observable<MensajePlantillaCorreoDTO> {
        return this.http.post<MensajePlantillaCorreoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${key}`, undefined),
            {}
        );
    }

    createTemplate(template: MensajePlantillaCorreoDTO): Observable<MensajePlantillaCorreoDTO> {
        return this.http.post<MensajePlantillaCorreoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/create`, undefined),
            template
        );
    }

    updateTemplate(template: MensajePlantillaCorreoDTO): Observable<MensajePlantillaCorreoDTO> {
        return this.http.post<MensajePlantillaCorreoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/update`, undefined),
            template
        );
    }

    inactivateTemplate(template: MensajePlantillaCorreoDTO): Observable<MensajePlantillaCorreoDTO> {
        return this.http.post<MensajePlantillaCorreoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${template.llaveTabla}/inactivate`, undefined),
            template
        );
    }
}