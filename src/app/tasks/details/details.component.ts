import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { debounceTime, filter, Subject, takeUntil, tap } from 'rxjs';
import { assign } from 'lodash-es';
import { Task } from 'app/tasks/tasks.types';
import { TasksListComponent } from 'app/tasks/list/list.component';
import { TasksService } from 'app/tasks/tasks.service';

@Component({
    selector: 'tasks-details',
    templateUrl: './details.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TasksDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('titleField') private _titleField: ElementRef;

    task: Task;
    taskForm: UntypedFormGroup;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router,
        private _tasksListComponent: TasksListComponent,
        private _tasksService: TasksService,
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Open the drawer
        this._tasksListComponent.matDrawer.open();

        // Create the task form
        this.taskForm = this._formBuilder.group({
            key: [''],
            title: [''],
            notes: ['', Validators.maxLength(4000)],
            dueDate: [null],
            priority: [0],
            order: [0]
        });

        // Get the task
        this._tasksService.task$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((task: Task) => {

                // Open the drawer in case it is closed
                this._tasksListComponent.matDrawer.open();

                // Get the task
                this.task = task;

                // Patch values to the form from the task
                this.taskForm.patchValue(task, { emitEvent: false });

                if (!task) this.closeDrawer();
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Update task when there is a value change on the task form
        this.taskForm.valueChanges
            .pipe(
                tap((value) => {
                    // Update the task object
                    this.task = assign(this.task, value);
                }),
                debounceTime(500),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe((value) => {
                if (this.taskForm.invalid) { return; }
                // Update the task on the server
                this._tasksService.updateTask(value).subscribe();
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
                this._titleField.nativeElement.focus();
            });
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void {
        // Listen for matDrawer opened change
        this._tasksListComponent.matDrawer.openedChange
            .pipe(
                takeUntil(this._unsubscribeAll),
                filter(opened => opened)
            )
            .subscribe(() => {
                // Focus on the title element
                this._titleField.nativeElement.focus();
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Close the drawer
     */
    closeDrawer(): Promise<MatDrawerToggleResult> {
        return this._tasksListComponent.matDrawer.close();
    }

    /**
     * Toggle the completed status
     */
    toggleCompleted(): void {
        // Toggle the completed status
        if (this.task.completed) { this.task.completed = null }
        else { this.task.completed = new Date() }

        // Update the task on the server
        this._tasksService.updateTask(this.task).subscribe();

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Set the task priority
     *
     * @param priority
     */
    setTaskPriority(priority): void {
        // Set the value
        this.taskForm.get('priority').setValue(priority);
    }

    /**
     * Check if the task is overdue or not
     */
    isOverdue(): boolean {
        if (!this.task.dueDate) return false;
        return new Date(this.task.dueDate).getTime() > new Date().getTime();
    }

    /**
     * Delete the task
     */
    deleteTask(): void {
        this._tasksService.deleteTask(this.task.key).subscribe(() => {
            this.closeDrawer();
            this._changeDetectorRef.markForCheck();
        });
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
