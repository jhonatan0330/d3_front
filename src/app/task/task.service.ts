import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import { Task, TaskRequest } from 'app/task/task.domain';
import { SharedIdResponse } from 'app/shared/api-types';
import { LocalStoreService } from 'app/shared/local-store.service';
import { LoginService } from 'app/authentication/login.service';

@Injectable({
    providedIn: 'root'
})
export class TasksService {
    private _httpClient = inject(HttpClient);
    private ls = inject(LocalStoreService);
    private _loginService = inject(LoginService);

    private readonly _task = signal<Task | null>(null);
    private readonly _tasks = signal<Task[] | null>(null);

    get task() {
        return this._task.asReadonly();
    }
    get tasks() {
        return this._tasks.asReadonly();
    }

    getTasks(_server: string | undefined = undefined): Observable<Task[]> {
        return this._httpClient.get<Task[]>(
            this.ls.getUrlAccess('/task/', _server)
        ).pipe(
            tap((response) => {
                this._tasks.set(response);
            })
        );
    }

    selectTask(_task:Task){
        this._task.set(_task);
    }


    getTaskById(id: string, _server: string | undefined = undefined): Observable<Task> {
        return this._httpClient.get<Task>(
            this.ls.getUrlAccess('/task/' + id + '?id=' + id, _server)
        );
    }

    createTask(title: string, _server: string | undefined = undefined): Observable<string> {
        const user = this._loginService.getUser();
        const taskRequest: TaskRequest = {
            key: null,
            user: user?.llaveTabla ?? '',
            title: title,
            notes: '',
            completed: null,
            dueDate: null,
            priority: 1,
            order: 0
        };
        return this._httpClient.post<SharedIdResponse>(
            this.ls.getUrlAccess('/task/create', _server), taskRequest
        ).pipe(
            map((idTask) => {
                const newTask: Task = {
                    ...taskRequest,
                    key: idTask.id,
                    createdAt: new Date().toISOString()
                };
                this._tasks.update(tasks => [newTask, ...(tasks ?? [])]);
                return idTask.id;
            })
        );
    }

    updateTask(task: Task, _server: string | undefined = undefined): Observable<SharedIdResponse> {
        const taskRequest: TaskRequest = {
            key: task.key,
            user: task.user,
            title: task.title,
            notes: task.notes,
            completed: task.completed,
            dueDate: task.dueDate,
            priority: task.priority,
            order: task.order
        };
        return this._httpClient.post<SharedIdResponse>(
            this.ls.getUrlAccess('/task/update', _server), taskRequest
        );
    }

    deleteTask(id: string, _server: string | undefined = undefined): Observable<SharedIdResponse> {
        return this._httpClient.post<SharedIdResponse>(
            this.ls.getUrlAccess('/task/delete/' + id, _server), null
        ).pipe(
            map((idTask) => {
                this._tasks.update(tasks => (tasks ?? []).filter((item) => item.key !== idTask.id));
                return idTask;
            })
        );
    }
}
