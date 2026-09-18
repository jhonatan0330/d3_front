import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { SharedIdResponse } from 'app/shared/api-types';
import { LocalStoreService } from 'app/shared/local-store.service';
import { Task, TaskRequest } from 'app/task/domain/task.domain';

@Injectable({
    providedIn: 'root'
})
export class TaskApi {
    private http = inject(HttpClient);
    private ls = inject(LocalStoreService);

    getTasks(): Observable<Task[]> {
        return this.http.get<Task[]>(
            this.ls.getUrlAccess('/task/')
        );
    }

    getTaskById(id: string): Observable<Task> {
        return this.http.get<Task>(
            this.ls.getUrlAccess('/task/' + id + '?id=' + id)
        );
    }

    createTask(taskRequest: TaskRequest): Observable<SharedIdResponse> {
        return this.http.post<SharedIdResponse>(
            this.ls.getUrlAccess('/task/create'), taskRequest
        );
    }

    updateTask(taskRequest: TaskRequest): Observable<SharedIdResponse> {
        return this.http.post<SharedIdResponse>(
            this.ls.getUrlAccess('/task/update'), taskRequest
        );
    }

    deleteTask(id: string): Observable<SharedIdResponse> {
        return this.http.post<SharedIdResponse>(
            this.ls.getUrlAccess('/task/delete/' + id), null
        );
    }
}