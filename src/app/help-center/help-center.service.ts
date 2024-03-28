import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LocalStoreService } from 'app/shared/local-store.service';
import { Article } from './help-center.type';
import { Observable } from 'rxjs';
import { PedidoVentaDTO } from 'app/modules/full/neuron/model/sw42.domain';

@Injectable({ providedIn: 'root' })
export class HelpCenterService {

    constructor(private http: HttpClient,
        private ls: LocalStoreService) {
    }

    getArticleByType(type: string, id: string): Observable<Article> {
        return this.http.get<Article>(this.ls.getUrlAccess('/help/article?type=' + type + '&id=' + id));
    }

    getQuestionByArticle(articleId:string): Observable<PedidoVentaDTO[]> {
        return this.http.get<PedidoVentaDTO[]>(this.ls.getUrlAccess('/help/question?article=' + articleId));
    }

    getAnswerByQuestion(questionId:string): Observable<PedidoVentaDTO[]> {
        return this.http.get<PedidoVentaDTO[]>(this.ls.getUrlAccess('/help/answer?question=' + questionId));
    }

}
