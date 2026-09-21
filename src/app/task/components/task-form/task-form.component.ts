import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    ElementRef,
    effect,
    inject,
    viewChild
} from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
    FormBuilder,
    FormsModule,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatDialogRef } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';

import {
    debounceTime,
    filter,
    map,
    switchMap
} from 'rxjs';

import {
    Editor,
    NgxEditorModule,
    Toolbar
} from '@bobbyquantum/ngx-editor';

import { Task } from 'app/task/domain/task.domain';
import { TasksService } from 'app/task/business/task.service';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';

@Component({
    selector: 'tasks-form',
    templateUrl: './task-form.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        FormsModule,
        MatFormFieldModule,
        MatIcon,
        MatInputModule,
        NgxEditorModule,
        ReactiveFormsModule,
        RouterModule
    ]
})
export class TaskFormComponent {

    private readonly destroyRef = inject(DestroyRef);
    private readonly formBuilder = inject(FormBuilder);
    private readonly notificationCenter = inject(NotificationCenterService);
    private readonly tasksService = inject(TasksService);
    private readonly dialogRef = inject(MatDialogRef<TaskFormComponent>);

    readonly task = this.tasksService.task;

    // -------------------------------------------------------------------------
    // View
    // -------------------------------------------------------------------------

    readonly titleField =
        viewChild<ElementRef<HTMLInputElement>>('titleField');

    // -------------------------------------------------------------------------
    // Form
    // -------------------------------------------------------------------------

    readonly taskForm = this.formBuilder.group({
        key: [''],
        title: [''],
        notes: ['', Validators.maxLength(4000)],
        dueDate: [''],
        priority: [0],
        order: [0]
    });

    // -------------------------------------------------------------------------
    // Editor
    // -------------------------------------------------------------------------

    readonly toolbar: Toolbar = [
        ['bold', 'italic'],
        ['underline', 'strike'],
        ['code', 'blockquote'],
        ['ordered_list', 'bullet_list'],
        [
            {
                heading: [
                    'h1',
                    'h2',
                    'h3',
                    'h4',
                    'h5',
                    'h6'
                ]
            }
        ],
        ['link', 'image'],
        ['text_color', 'background_color'],
        [
            'align_left',
            'align_center',
            'align_right',
            'align_justify'
        ]
    ];

    readonly editor = new Editor();

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor() {

        effect(() => {
            const task = this.task();

            if (!task) {
                this.taskForm.reset({}, {
                    emitEvent: false
                });

                return;
            }

            this.taskForm.patchValue(
                {
                    key: task.key,
                    title: task.title,
                    notes: task.notes,
                    dueDate: task.dueDate,
                    priority: task.priority,
                    order: task.order
                },
                {
                    emitEvent: false
                }
            );

        });

        this.listenFormChanges();
    }

    // -------------------------------------------------------------------------
    // Form changes
    // -------------------------------------------------------------------------

    private listenFormChanges(): void {

        this.taskForm.valueChanges
            .pipe(
                debounceTime(500),

                filter(() => this.taskForm.valid),

                map(value => {
                    const task = this.task();

                    if (!task) {
                        return null;
                    }

                    return {
                        task,
                        value
                    };
                }),

                filter(
                    (
                        data
                    ): data is {
                        task: Task;
                        value: typeof this.taskForm.value;
                    } => data !== null
                ),

                switchMap(({ task, value }) => {

                    return this.tasksService.updateTask({
                        ...task,
                        ...value
                    });
                }),

                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe({
                error: () => {}
            });
    }

    // -------------------------------------------------------------------------
    // Actions
    // -------------------------------------------------------------------------

    closeDrawer(): void {
        this.dialogRef.close();
        this.tasksService.clearSelectedTask();
    }

    onTitleEmpty(): void {

        const title = this.taskForm.controls.title.value;

        if (!title?.trim()) {
            this.notificationCenter.warn(
                'Atencion',
                'Primero escribe el titulo, para poder editar la nota.'
            );
        }
    }
}
