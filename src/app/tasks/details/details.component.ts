import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, ElementRef, OnDestroy, OnInit,  inject, viewChild } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { debounceTime, filter, Subject, takeUntil, tap } from 'rxjs';
import { Task } from 'app/tasks/tasks.types';
import { TasksListComponent } from 'app/tasks/list/list.component';
import { TasksService } from 'app/tasks/tasks.service';
import { Editor, NgxEditorModule, Toolbar } from '@bobbyquantum/ngx-editor';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { MatInputModule } from '@angular/material/input';
import { NotificationCenterService } from 'app/notification/notification-center.service';

@Component({
    selector: 'tasks-details',
    templateUrl: './details.component.html',

    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgxEditorModule, FormsModule, MatFormFieldModule, MatIconModule, ReactiveFormsModule, RouterModule, MatMenuModule, MatInputModule]
})
export class TasksDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
    private _changeDetectorRef = inject(ChangeDetectorRef);
    private _formBuilder = inject(UntypedFormBuilder);
    private _router = inject(Router);
    private _tasksListComponent = inject(TasksListComponent);
    private _tasksService = inject(TasksService);
    private notificationCenter = inject(NotificationCenterService);

    private readonly _titleField = viewChild<ElementRef>('titleField');

    task: Task;
    taskForm: UntypedFormGroup;
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
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor() {
        effect(() => {
            const task = this._tasksService.task();

            // Open the drawer in case it is closed
            this._tasksListComponent.matDrawer().open();

            // Get the task
            this.task = task ?? this.task;

            if (task) {
                // Patch values to the form from the task
                this.taskForm.patchValue(task, { emitEvent: false });
            }

            if (!task) this.closeDrawer();
            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

    ngOnInit(): void {
        // Open the drawer
        this._tasksListComponent.matDrawer().open();

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
                takeUntil(this._unsubscribeAll)
            )
            .subscribe((value) => {
                if (this.taskForm.invalid) { return; }
                // Update the task on the server
                this._tasksService.updateTask(value).subscribe({ error: () => {} });
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Listen for NavigationEnd event to focus on the title field
        this._router.events
            .pipe(
                takeUntil(this._unsubscribeAll),
                filter(event => event instanceof NavigationEnd)
            )
            .subscribe(() => {
                // Focus on the title field
                this._titleField().nativeElement.focus();
            });
    }

    ngAfterViewInit(): void {
        // Listen for matDrawer opened change
        this._tasksListComponent.matDrawer().openedChange
            .pipe(
                takeUntil(this._unsubscribeAll),
                filter(opened => opened)
            )
            .subscribe(() => {
                // Focus on the title element
                this._titleField().nativeElement.focus();
            });
    }


    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
        this.editor.destroy();
    }

    closeDrawer(): Promise<MatDrawerToggleResult> {
        return this._tasksListComponent.matDrawer().close();
    }


    toggleCompleted(): void {

        if (this.task.completed) { this.task.completed = null }
        else { this.task.completed = new Date() }

        // Update the task on the server
        this._tasksService.updateTask(this.task).subscribe({ error: () => {} });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    setTaskPriority(priority): void {
        // Set the value
        this.taskForm.get('priority').setValue(priority);
    }

    isOverdue(): boolean {
        if (!this.task.dueDate) return false;
        return new Date(this.task.dueDate).getTime() > new Date().getTime();
    }

    deleteTask(): void {
        this._tasksService.deleteTask(this.task.key).subscribe(() => {
            this.closeDrawer();
            this._changeDetectorRef.markForCheck();
        });
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
