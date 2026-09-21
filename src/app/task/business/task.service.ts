import { effect, Injectable, inject, signal } from '@angular/core';
import { map, Observable, of, tap, finalize, shareReplay } from 'rxjs';

import { Task, TaskRequest } from 'app/task/domain/task.domain';
import { SharedIdResponse } from 'app/shared/api-types';
import { LoginService } from 'app/authentication/login.service';
import { TaskApi } from 'app/task/task.api';

@Injectable({
    providedIn: 'root'
})
export class TasksService {

    private readonly taskApi = inject(TaskApi);

    private readonly _task = signal<Task | null>(null);
    private readonly _tasks = signal<Task[]>([]);

    readonly task = this._task.asReadonly();
    readonly tasks = this._tasks.asReadonly();

    getTasks() {
        return this.taskApi.getTasks().pipe(
            tap(tasks => {
                this._tasks.set(tasks);
            })
        ).subscribe();
    }


    selectTask(task: Task): void {
        this._task.set(task);
    }

    clearSelectedTask(): void {
        this._task.set(null);
    }

    getTaskById(id: string): Observable<Task> {
        return this.taskApi.getTaskById(id);
    }

    createTask(title: string): Observable<string> {

        const taskRequest: TaskRequest = {
            key: null,
            title,
            notes: '',
            completed: null,
            dueDate: null,
            priority: 1,
            order: 0
        };

        return this.taskApi.createTask(taskRequest).pipe(
            map(response => {

                const newTask: Task = {
                    ...taskRequest,
                    key: response.id,
                    createdAt: new Date().toISOString()
                };

                this._tasks.update(tasks => [
                    newTask,
                    ...tasks
                ]);

                return response.id;
            })
        );
    }

    updateTask(task: Task): Observable<SharedIdResponse> {

        const taskRequest: TaskRequest = {
            key: task.key,
            title: task.title,
            notes: task.notes,
            completed: task.completed,
            dueDate: task.dueDate,
            priority: task.priority,
            order: task.order
        };

        return this.taskApi.updateTask(taskRequest).pipe(
            tap(() => {
                this._tasks.update(tasks =>
                    tasks.map(item =>
                        item.key === task.key
                            ? task
                            : item
                    )
                );

                if (this._task()?.key === task.key) {
                    this._task.set(task);
                }
            })
        );
    }

    deleteTask(id: string): Observable<SharedIdResponse> {
        return this.taskApi.deleteTask(id).pipe(
            tap(response => {
                this._tasks.update(tasks =>
                    tasks.filter(item =>
                        item.key !== response.id
                    )
                );

                if (this._task()?.key === response.id) {
                    this._task.set(null);
                }
            })
        );
    }
}
