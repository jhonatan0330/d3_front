import { ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, OnDestroy, OnInit, DOCUMENT, inject, signal, viewChild, ElementRef, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ActivatedRoute, NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { CdkDragDrop, moveItemInArray, CdkDropList, CdkDrag, CdkDragPreview, CdkDragHandle } from '@angular/cdk/drag-drop';
import { debounceTime, filter, fromEvent, tap } from 'rxjs';
import { Task } from 'app/task/task.types';
import { TasksService } from 'app/task/task.service';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { NgClass, DatePipe } from '@angular/common';
import { DropdownComponent } from 'app/shared/components/dropdown/dropdown.component';
import { DropdownItemComponent } from 'app/shared/components/dropdown/dropdown-item.component';
import { LoginService } from 'app/authentication/login.service';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Editor, NgxEditorModule, Toolbar } from '@bobbyquantum/ngx-editor';
import { NotificationCenterService } from 'app/notification/notification-center.service';

@Component({
    selector: 'tasks-list',
    templateUrl: './tasks.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ MatTooltip, MatIcon, CdkDropList, CdkDrag, NgClass, CdkDragPreview, CdkDragHandle, DatePipe, DropdownComponent, DropdownItemComponent, NgxEditorModule, FormsModule, MatFormFieldModule, MatIconModule, ReactiveFormsModule, RouterModule, MatInputModule]
})
export class TasksListComponent implements OnInit, OnDestroy {
    private _activatedRoute = inject(ActivatedRoute);
    private _changeDetectorRef = inject(ChangeDetectorRef);
    private _document = inject(DOCUMENT);
    private _router = inject(Router);
    private _tasksService = inject(TasksService);
    private destroyRef = inject(DestroyRef);
    private _jwt = inject(LoginService);

        
    private _formBuilder = inject(FormBuilder);
    private notificationCenter = inject(NotificationCenterService);
    
    
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
        effect(() => {
            const task = this._tasksService.task();


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

    if (!this._jwt.validateAccessModule('tasks')) {
            this._router.navigate(['/main']);
            return;
        }

        this.drawerMode = this._mediaQuery.matches ? 'side' : 'over';
        this._mediaQuery.addEventListener('change', this._mediaHandler);

        fromEvent<KeyboardEvent>(this._document, 'keydown')
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                filter(event =>
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
        this._mediaQuery.removeEventListener('change', this._mediaHandler);
        this.editor.destroy();
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

        if (task.completed) { task.completed = null }
        else { task.completed = new Date().toISOString() }

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
        return item.key || index;
    }

    selectTask(_task: Task) {
        this._tasksService.selectTask(_task);
        this._router.navigate(['./' + _task.key], { relativeTo: this._activatedRoute });
    }


        deleteTask(_task: Task): void {
        this._tasksService.deleteTask(_task.key)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({ next: () => {
            this.closeDrawer();
            this._changeDetectorRef.markForCheck();
        }, error: () => {} });
    }



    setTaskPriority(priority): void {
        // Set the value
        this.taskForm.get('priority')!.setValue(priority);
    }

    isOverdue(): boolean {
        if (!this.task.dueDate) return false;
        return new Date(this.task.dueDate).getTime() > new Date().getTime();
    }
    
}
