import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation, DOCUMENT } from '@angular/core';

import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { CdkDragDrop, moveItemInArray, CdkDropList, CdkDrag, CdkDragPreview, CdkDragHandle } from '@angular/cdk/drag-drop';
import { MatDrawer, MatDrawerContainer, MatDrawerContent } from '@angular/material/sidenav';
import { filter, fromEvent, Subject, take, takeUntil } from 'rxjs';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { Task } from 'app/tasks/tasks.types';
import { TasksService } from 'app/tasks/tasks.service';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { NgClass, DatePipe } from '@angular/common';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';

@Component({
    selector: 'tasks-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatDrawerContainer, MatDrawer, RouterOutlet, MatDrawerContent, MatButton, MatTooltip, MatIcon, CdkDropList, CdkDrag, NgClass, CdkDragPreview, CdkDragHandle, MatIconButton, MatMenuTrigger, MatMenu, MatMenuItem, DatePipe]
})
export class TasksListComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    drawerMode: 'side' | 'over';
    selectedTask: Task;
    tasks: Task[];
    tasksCount: any = {
        completed: 0,
        incomplete: 0,
        total: 0
    };
    private _unsubscribeAll: Subject<any> = new Subject<any>();


    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _tasksService: TasksService,
        private _fuseMediaWatcherService: FuseMediaWatcherService
    ) {
    }


    ngOnInit(): void {

        // Get the tasks
        this._tasksService.tasks$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((tasks: Task[]) => {
                this.tasks = tasks;
                if (!this.tasks) this.tasks = [];
                // Update the counts
                this.tasksCount.total = this.tasks.length;
                this.tasksCount.completed = this.tasks.filter(task => task.completed).length;
                this.tasksCount.incomplete = this.tasksCount.total - this.tasksCount.completed;

                // Mark for check
                this._changeDetectorRef.markForCheck();

            });

        // Get the task
        this._tasksService.task$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((task: Task) => {
                this.selectedTask = task;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._fuseMediaWatcherService.onMediaQueryChange$('(min-width: 1440px)')
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((state) => {

                // Calculate the drawer mode
                this.drawerMode = state.matches ? 'side' : 'over';

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        fromEvent(this._document, 'keydown')
            .pipe(
                takeUntil(this._unsubscribeAll),
                filter<KeyboardEvent>(event =>
                    (event.ctrlKey === true || event.metaKey) // Ctrl or Cmd
                    && (event.key === '/' || event.key === '.') // '/' or '.' key
                )
            )
            .subscribe((event: KeyboardEvent) => {

                // If the '/' pressed
                if (event.key === '/') {
                    this.createTask();
                }


            });

        this._tasksService.getTasks().subscribe();
    }


    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    onBackdropClicked(): void {
        // Go back to the list
        this._router.navigate(['./'], { relativeTo: this._activatedRoute });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }


    createTask(): void {
        this._tasksService.createTask("").subscribe((id) => {
            this._tasksService.tasks$.pipe(take(1)).subscribe((tasks) => {
                const task = tasks.find((t) => t.key === id);
                if (task) {
                    this._tasksService.selectTask(task);
                    this.selectTask(task);
                } else console.log("no se encontro nueva tarea");
            });
        });
    }

    toggleCompleted(task: Task): void {

        if (task.completed) { task.completed = null }
        else { task.completed = new Date() }

        this._tasksService.updateTask(task).subscribe();

        this._changeDetectorRef.markForCheck();
    }

    dropped(event: CdkDragDrop<Task[]>): void {

        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        this._changeDetectorRef.markForCheck();
    }


    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    selectTask(_task: Task) {
        this._tasksService.selectTask(_task);
        this._router.navigate(['./' + _task.key], { relativeTo: this._activatedRoute });
    }

    deleteTask(_task: Task): void {
        this._tasksService.deleteTask(_task.key).subscribe(() => {
            this._router.navigate(['./'], { relativeTo: this._activatedRoute });
            this._changeDetectorRef.markForCheck();
        });
    }
    
}
