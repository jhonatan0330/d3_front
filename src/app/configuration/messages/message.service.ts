import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { LocalStoreService } from 'app/shared/local-store.service';
import { MensajeDTO, MensajeFilterDTO } from 'app/document/model/sw42.domain';

@Injectable({
    providedIn: 'root'
})
export class MessageService {
    private http = inject(HttpClient);
    private ls = inject(LocalStoreService);

    private baseUrl = '/api/config/messages';

    getMessages(filter?: MensajeFilterDTO): Observable<MensajeDTO[]> {
        const payload = {
            estado: filter?.estado || 'A',
            fechaDesde: filter?.fechaDesde,
            fechaHasta: filter?.fechaHasta,
            enviado: filter?.enviado || '',
            usuario: filter?.usuario || '',
            titulo: filter?.titulo || '',
            paginacionRegistroInicial: filter?.paginacionRegistroInicial || 0,
            paginacionRegistroFinal: filter?.paginacionRegistroFinal || 50
        };
        return this.http.post<MensajeDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/list`, undefined),
            payload
        );
    }

    getMessageById(key: string): Observable<MensajeDTO> {
        return this.http.post<MensajeDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${key}`, undefined),
            {}
        );
    }

    resendMessage(key: string): Observable<MensajeDTO> {
        return this.http.post<MensajeDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${key}/resend`, undefined),
            {}
        );
    }
}