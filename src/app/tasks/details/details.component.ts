import { ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, ElementRef, OnDestroy, OnInit, inject, viewChild, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime, filter, tap } from 'rxjs';
import { Task } from 'app/tasks/tasks.types';
import { TasksListComponent } from 'app/tasks/list/list.component';
import { TasksService } from 'app/tasks/tasks.service';
import { Editor, NgxEditorModule, Toolbar } from '@bobbyquantum/ngx-editor';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

import { MatInputModule } from '@angular/material/input';
import { NotificationCenterService } from 'app/notification/notification-center.service';

@Component({
    selector: 'tasks-details',
    templateUrl: './details.component.html',

    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgxEditorModule, FormsModule, MatFormFieldModule, MatIconModule, ReactiveFormsModule, RouterModule, MatInputModule]
})
export class TasksDetailsComponent implements OnInit, OnDestroy {
    private _changeDetectorRef = inject(ChangeDetectorRef);
    private _formBuilder = inject(FormBuilder);
    private _router = inject(Router);
    private _tasksListComponent = inject(TasksListComponent);
    private _tasksService = inject(TasksService);
    private notificationCenter = inject(NotificationCenterService);
    private destroyRef = inject(DestroyRef);

    private readonly _titleField = viewChild<ElementRef>('titleField');

    task: Task;
    taskForm: FormGroup;
    public editor: Editor;
    toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link', 'image'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];

    constructor() {
        effect(() => {
            const task = this._tasksService.task();

            // Open the drawer in case it is closed
            this._tasksListComponent.openDrawer();

            // Get the task
            this.task = task ?? this.task;

            if (task) {
                // Patch values to the form from the task
                this.taskForm.patchValue(task, { emitEvent: false });
                // Focus title field when drawer opens with a task
                setTimeout(() => this._titleField()?.nativeElement?.focus());
            }

            if (!task) this.closeDrawer();
            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

    ngOnInit(): void {
        // Open the drawer
        this._tasksListComponent.openDrawer();

        this.editor = new Editor();

        // Create the task form
        this.taskForm = this._formBuilder.group({
            key: [''],
            title: [''],
            notes: ['', Validators.maxLength(4000)],
            dueDate: [null],
            priority: [0],
            order: [0]
        });

        // Update task when there is a value change on the task form
        this.taskForm.valueChanges
            .pipe(
                tap((value) => {
                    // Update the task object
                    this.task.title = value.title;
                    if(value.title != ""){
                    this.task.notes = value.notes;
                    this.task.completed = value.completed;
                    }else{
                        this.notificationCenter.warn("Atencion", "Primero escribe el titulo, para poder editar la nota.");
                    }
                }),
                debounceTime(500),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((value) => {
                if (this.taskForm.invalid) { return; }
                // Update the task on the server
                this._tasksService.updateTask(value)
                    .pipe(takeUntilDestroyed(this.destroyRef))
                    .subscribe({ error: () => {} });
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Listen for NavigationEnd event to focus on the title field
        this._router.events
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                filter(event => event instanceof NavigationEnd)
            )
            .subscribe(() => {
                // Focus on the title field
                this._titleField()!.nativeElement.focus();
            });
    }



    ngOnDestroy(): void {
        this.editor.destroy();
    }

    closeDrawer(): void {
        this._tasksListComponent.closeDrawer();
    }


    toggleCompleted(): void {

        if (this.task.completed) { this.task.completed = null as any }
        else { this.task.completed = new Date() }

        // Update the task on the server
        this._tasksService.updateTask(this.task)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({ error: () => {} });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    setTaskPriority(priority): void {
        // Set the value
        this.taskForm.get('priority')!.setValue(priority);
    }

    isOverdue(): boolean {
        if (!this.task.dueDate) return false;
        return new Date(this.task.dueDate).getTime() > new Date().getTime();
    }

    deleteTask(): void {
        this._tasksService.deleteTask(this.task.key)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({ next: () => {
            this.closeDrawer();
            this._changeDetectorRef.markForCheck();
        }, error: () => {} });
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
