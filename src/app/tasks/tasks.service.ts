import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import { Task } from 'app/tasks/tasks.types';
import { IdResponse } from 'app/modules/full/neuron/model/sw42.utils';
import { LocalStoreService } from 'app/shared/local-store.service';

@Injectable({
    providedIn: 'root'
})
export class TasksService {
    private _httpClient = inject(HttpClient);
    private ls = inject(LocalStoreService);

    // Private
    private readonly _task = signal<Task | null>(null);
    private readonly _tasks = signal<Task[] | null>(null);

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for task
     */
    get task() {
        return this._task.asReadonly();
    }

    /**
     * Getter for tasks
     */
    get tasks() {
        return this._tasks.asReadonly();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get tasks
     */
    getTasks(_server: string = null): Observable<Task[]> {
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

    /**
     * Update tasks orders
     *
     * @param tasks
     
    updateTasksOrders(tasks: Task[], _server: string = null): Observable<Task[]>
    {
        return this._httpClient.patch<Task[]>('api/apps/tasks/order', {tasks});
    }*/


    /**
     * Get task by id
     */
    getTaskById(id: string, _server: string = null): Observable<Task> {
        return this._httpClient.get<Task>(
            this.ls.getUrlAccess('/task/' + id, _server)
        );
    }

    /**
     * Create task
     *
     * @param type
     */
    createTask(title: string, _server: string = null): Observable<string> {
        const task: Task = {
            title: title,
            key: null,
            notes: null,
            completed: null,
            dueDate: null,
            priority: 1,
            order: 0
        }
        return this._httpClient.post<IdResponse>(
            this.ls.getUrlAccess('/task/create', _server), task
        ).pipe(
            map((idTask) => {
                task.key = idTask.id;
                this._tasks.update(tasks => [task, ...(tasks ?? [])]);
                return idTask.id;
            })
        );
    }

    /**
     * Update task
     *
     * @param id
     * @param task
     */
    updateTask(task: Task, _server: string = null): Observable<IdResponse> {
        return this._httpClient.post<IdResponse>(
            this.ls.getUrlAccess('/task/update', _server), task
        );
    }

    /**
     * Delete the task
     *
     * @param id
     */
    deleteTask(id: string, _server: string = null): Observable<IdResponse> {
        return this._httpClient.post<IdResponse>(
            this.ls.getUrlAccess('/task/delete/' + id, _server), null
        ).pipe(
            map((idTask) => {
                this._tasks.update(tasks => (tasks ?? []).filter((item) => item.key !== idTask.id));
                return idTask;
            })
        );
    }
}
