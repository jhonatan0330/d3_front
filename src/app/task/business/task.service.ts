import { Injectable, inject, signal } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { Task, TaskRequest } from 'app/task/domain/task.domain';
import { SharedIdResponse } from 'app/shared/api-types';
import { LoginService } from 'app/authentication/login.service';
import { TaskApi } from 'app/task/task.api';

@Injectable({
    providedIn: 'root'
})
export class TasksService {
    private _taskApi = inject(TaskApi);
    private _loginService = inject(LoginService);

    private readonly _task = signal<Task | null>(null);
    private readonly _tasks = signal<Task[] | null>(null);

    get task() {
        return this._task.asReadonly();
    }
    get tasks() {
        return this._tasks.asReadonly();
    }

    getTasks(): Observable<Task[]> {
        return this._taskApi.getTasks().pipe(
            tap((response) => {
                this._tasks.set(response);
            })
        );
    }

    selectTask(_task:Task){
        this._task.set(_task);
    }


    getTaskById(id: string): Observable<Task> {
        return this._taskApi.getTaskById(id);
    }

    createTask(title: string): Observable<string> {
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
        return this._taskApi.createTask(taskRequest).pipe(
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

    updateTask(task: Task): Observable<SharedIdResponse> {
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
        return this._taskApi.updateTask(taskRequest);
    }

    deleteTask(id: string): Observable<SharedIdResponse> {
        return this._taskApi.deleteTask(id).pipe(
            map((idTask) => {
                this._tasks.update(tasks => (tasks ?? []).filter((item) => item.key !== idTask.id));
                return idTask;
            })
        );
    }
}
