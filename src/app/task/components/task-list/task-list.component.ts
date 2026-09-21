import {
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    DOCUMENT,
    inject,
    OnInit
} from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    CdkDrag,
    CdkDragDrop,
    CdkDragHandle,
    CdkDropList,
    moveItemInArray
} from '@angular/cdk/drag-drop';

import { DatePipe, NgClass } from '@angular/common';
import { filter, fromEvent } from 'rxjs';

import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { Task } from 'app/task/domain/task.domain';
import { TasksService } from 'app/task/business/task.service';

import { DropdownComponent } from 'app/shared/components/dropdown/dropdown/dropdown.component';
import { DropdownItemComponent } from 'app/shared/components/dropdown/dropdown-item/dropdown-item.component';
import { TaskFormComponent } from '../task-form/task-form.component';

@Component({
    selector: 'tasks-list',
    templateUrl: './task-list.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CdkDropList,
        CdkDrag,
        CdkDragHandle,
        DatePipe,
        DropdownComponent,
        DropdownItemComponent,
        MatDialogModule,
        MatIcon,
        MatTooltip,
        NgClass
    ]
})
export class TaskListComponent implements OnInit {

    private readonly document = inject(DOCUMENT);
    private readonly destroyRef = inject(DestroyRef);
    private readonly dialog = inject(MatDialog);
    private readonly tasksService = inject(TasksService);

    readonly tasks = this.tasksService.tasks;
    readonly selectedTask = this.tasksService.task;

    readonly taskCount = computed(() => {
        const tasks = this.tasks();

        const completed = tasks.filter(
            task => !!task.completed
        ).length;

        return {
            total: tasks.length,
            completed,
            incomplete: tasks.length - completed
        };
    });

    ngOnInit(): void {
        this.listenKeyboardShortcuts();
    }

    private listenKeyboardShortcuts(): void {
        fromEvent<KeyboardEvent>(
            this.document,
            'keydown'
        )
        .pipe(
            filter(event =>
                (event.ctrlKey || event.metaKey) &&
                event.key === '/'
            ),
            takeUntilDestroyed(this.destroyRef)
        )
        .subscribe(() => this.createTask());
    }

    createTask(): void {
        this.tasksService
            .createTask('')
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: id => {
                    const task = this.tasks().find(
                        item => item.key === id
                    );

                    if (task) {
                        this.tasksService.selectTask(task);
                        this.openTaskDialog();
                    }
                },
                error: () => {}
            });
    }

    selectTask(task: Task): void {
        this.tasksService.selectTask(task);
        this.openTaskDialog();
    }

    private openTaskDialog(): void {
        const dialogRef = this.dialog.open(TaskFormComponent, {
            width: 'min(720px, calc(100vw - 32px))',
            maxWidth: '100vw',
            maxHeight: 'calc(100vh - 32px)',
            panelClass: 'task-form-dialog',
            autoFocus: false
        });

        dialogRef.afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.tasksService.clearSelectedTask());
    }

    toggleCompleted(task: Task): void {
        const updatedTask: Task = {
            ...task,
            completed: task.completed
                ? null
                : new Date().toISOString()
        };

        this.tasksService
            .updateTask(updatedTask)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                error: () => {}
            });
    }

    deleteTask(task: Task): void {
        this.tasksService
            .deleteTask(task.key)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                error: () => {}
            });
    }

    dropped(event: CdkDragDrop<Task[]>): void {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    }

    trackByFn(index: number, item: Task): string | number {
        return item.key || index;
    }
}
