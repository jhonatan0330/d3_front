import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LocalStoreService } from 'app/shared/local-store.service';
import { Article } from './help-center.type';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HelpCenterService {

    constructor(private http: HttpClient,
        private ls: LocalStoreService) {
    }

    getArticleByType(type: string, id: string): Observable<Article> {
        return this.http.get<Article>(this.ls.getUrlAccess('/help/article?type=' + type + '&id=' + id));
    }

}
