import { Component, output, inject, ChangeDetectionStrategy } from '@angular/core';
import { DropdownComponent } from './dropdown.component';

@Component({
    selector: 'app-dropdown-item',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <button class="w-full flex items-center gap-2 px-4 py-2 text-sm text-left
                       hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                       text-gray-700 dark:text-gray-200"
                (click)="onClick()">
            <ng-content></ng-content>
        </button>
    `
})
export class DropdownItemComponent {
    private readonly dropdown = inject(DropdownComponent);
    clicked = output<void>();

    onClick(): void {
        this.dropdown.close();
        this.clicked.emit();
    }
}
