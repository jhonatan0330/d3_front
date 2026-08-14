import { Component, output, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-dropdown-item',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <button class="w-full flex items-center gap-2 px-4 py-2 text-sm text-left
                       hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                       text-gray-700 dark:text-gray-200"
                (click)="onClick($event)">
            <ng-content></ng-content>
        </button>
    `
})
export class DropdownItemComponent {
    clicked = output<void>();

    onClick(event: Event): void {
        event.stopPropagation();
        this.clicked.emit();
    }
}
