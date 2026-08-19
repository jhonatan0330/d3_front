import { ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, OnDestroy, OnInit, DOCUMENT, inject, signal, viewChild, ElementRef, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { CdkDragDrop, moveItemInArray, CdkDropList, CdkDrag, CdkDragPreview, CdkDragHandle } from '@angular/cdk/drag-drop';
import { filter, fromEvent } from 'rxjs';
import { Task } from 'app/tasks/tasks.types';
import { TasksService } from 'app/tasks/tasks.service';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { NgClass, DatePipe } from '@angular/common';
import { DropdownComponent } from 'app/shared/components/dropdown/dropdown.component';
import { DropdownItemComponent } from 'app/shared/components/dropdown/dropdown-item.component';

@Component({
    selector: 'tasks-list',
    templateUrl: './list.component.html',

    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterOutlet,MatTooltip,MatIcon,CdkDropList,CdkDrag,NgClass,CdkDragPreview,CdkDragHandle,DatePipe,DropdownComponent,DropdownItemComponent]
})
export class TasksListComponent implements OnInit, OnDestroy {
    private _activatedRoute = inject(ActivatedRoute);
    private _changeDetectorRef = inject(ChangeDetectorRef);
    private _document = inject(DOCUMENT);
    private _router = inject(Router);
    private _tasksService = inject(TasksService);
    private destroyRef = inject(DestroyRef);

    readonly matDrawer = viewChild<ElementRef>('matDrawer');

    drawerOpened = signal(false);
    drawerMode: 'side' | 'over';
    selectedTask: Task | null;
    tasks: Task[];
    tasksCount: any = {
        completed: 0,
        incomplete: 0,
        total: 0
    };
    private _mediaQuery = window.matchMedia('(min-width: 1440px)');
    private _mediaHandler = (e: MediaQueryListEvent) => {
        this.drawerMode = e.matches ? 'side' : 'over';
        this._changeDetectorRef.markForCheck();
    };

    constructor() {
        effect(() => {
            const tasks = this._tasksService.tasks() ?? [];
            this.tasks = tasks;

            // Update the counts
            this.tasksCount.total = tasks.length;
            this.tasksCount.completed = tasks.filter(task => task.completed).length;
            this.tasksCount.incomplete = this.tasksCount.total - this.tasksCount.completed;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });

        effect(() => {
            this.selectedTask = this._tasksService.task() ?? null;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }


    ngOnInit(): void {

        this.drawerMode = this._mediaQuery.matches ? 'side' : 'over';
        this._mediaQuery.addEventListener('change', this._mediaHandler);

        fromEvent(this._document, 'keydown')
            .pipe(
                takeUntilDestroyed(this.destroyRef),
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

        this._tasksService.getTasks()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({ error: () => {} });
    }


    ngOnDestroy(): void {
        this._mediaQuery.removeEventListener('change', this._mediaHandler);
    }

    onBackdropClicked(): void {
        // Go back to the list
        this._router.navigate(['./'], { relativeTo: this._activatedRoute });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    openDrawer(): void {
        this.drawerOpened.set(true);
    }

    closeDrawer(): void {
        this.drawerOpened.set(false);
    }

    toggleDrawer(): void {
        this.drawerOpened.update((v) => !v);
    }


    createTask(): void {
        this._tasksService.createTask("")
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({ next: (id) => {
            const tasks = this._tasksService.tasks() ?? [];
            const task = tasks.find((t) => t.key === id);
            if (task) {
                this._tasksService.selectTask(task);
                this.selectTask(task);
            }
        }, error: () => {} });
    }

    toggleCompleted(task: Task): void {

        if (task.completed) { (task as any).completed = null }
        else { task.completed = new Date() }

        this._tasksService.updateTask(task)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({ error: () => {} });

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
        this._tasksService.deleteTask(_task.key)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({ next: () => {
            this._router.navigate(['./'], { relativeTo: this._activatedRoute });
            this._changeDetectorRef.markForCheck();
        }, error: () => {} });
    }
    
}
