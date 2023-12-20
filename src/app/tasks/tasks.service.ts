import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable,  switchMap, take, tap } from 'rxjs';
import { Task } from 'app/tasks/tasks.types';
import { IdResponse } from 'app/modules/full/neuron/model/sw42.utils';
import { LocalStoreService } from 'app/shared/local-store.service';

@Injectable({
    providedIn: 'root'
})
export class TasksService {
    // Private
    private _task: BehaviorSubject<Task | null> = new BehaviorSubject(null);
    private _tasks: BehaviorSubject<Task[] | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private ls: LocalStoreService) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for task
     */
    get task$(): Observable<Task> {
        return this._task.asObservable();
    }

    /**
     * Getter for tasks
     */
    get tasks$(): Observable<Task[]> {
        return this._tasks.asObservable();
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
                this._tasks.next(response);
            })
        );
    }

    selectTask(_task:Task){
        this._task.next(_task);
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
        return this.tasks$.pipe(
            take(1),
            switchMap(tasks =>
                this._httpClient.post<IdResponse>(
                    this.ls.getUrlAccess('/task/create', _server), task
                ).pipe(
                    map((idTask) => {
                        task.key = idTask.id;
                        this._tasks.next([task, ...tasks]);
                        return idTask.id;
                    })
                ))
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
        return this.tasks$.pipe(
            take(1),
            switchMap(tasks =>
                this._httpClient.post<IdResponse>(
                    this.ls.getUrlAccess('/task/delete/' + id, _server), null
                ).pipe(
                    map((idTask) => {
                        this._tasks.next(tasks.filter((item)=>{ return item.key !== idTask.id}));
                        return idTask;
                    })
                ))
        );
    }
}
