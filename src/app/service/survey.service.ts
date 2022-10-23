import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PostPreguntaDTO, PostRespuestaDTO } from 'app/model/sw42.domain';
import { Observable } from 'rxjs';
import { EncuestaDTO, EncuestaGrupoDTO } from '../model/survey.domain';

import { LocalStoreService } from '../shared/services/local-store.service';

@Injectable({
  providedIn: 'root',
})
export class SurveyService {
  constructor(private http: HttpClient, private ls: LocalStoreService) {}

  encuestasDisponibles(): Observable<EncuestaDTO[]> {
    return this.http.get<EncuestaDTO[]>(
      this.ls.getUrlAccess('/survey/getAvailable')
    );
  }

  responseGroupSurvey(group: EncuestaGrupoDTO): Observable<EncuestaGrupoDTO> {
    return this.http.post<EncuestaGrupoDTO>(
      this.ls.getUrlAccess('/survey/responseGroupSurvey'),
      group
    );
  }

  getFAQ(): Observable<PostPreguntaDTO[]> {
    return this.http.get<PostPreguntaDTO[]>(
      this.ls.getUrlAccess('/survey/getFAQ')
    );
  }

  getFAQResponse(id: String): Observable<PostRespuestaDTO[]> {
    return this.http.get<PostRespuestaDTO[]>(
      this.ls.getUrlAccess('/survey/getFAQResponse/' + id)
    );
  }
}
