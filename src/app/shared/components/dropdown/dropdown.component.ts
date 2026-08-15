import { Component, signal, HostListener, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-dropdown',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="relative inline-block">
            <div (click)="toggle($event)">
                <ng-content select="[trigger]"></ng-content>
            </div>
            @if (isOpen()) {
                <div class="absolute right-0 z-[999] mt-1 min-w-[12rem] bg-white dark:bg-gray-800
                            rounded-lg shadow-lg border border-gray-200 dark:border-gray-700
                            py-1 dropdown-menu">
                    <ng-content></ng-content>
                </div>
            }
        </div>
    `
})
export class DropdownComponent {
    isOpen = signal(false);

    toggle(event: Event): void {
        event.stopPropagation();
        this.isOpen.update(v => !v);
    }

    @HostListener('document:click')
    onDocumentClick(): void {
        this.isOpen.set(false);
    }

    close(): void {
        this.isOpen.set(false);
    }
}
