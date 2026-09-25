import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { FuseNavigationItem } from 'app/layout/domain/layout.types';

@Component({
    selector: 'simple-nav-item',
    templateUrl: './simple-nav-item.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgClass, RouterLink, RouterLinkActive, MatIcon, SimpleNavItemComponent]
})
export class SimpleNavItemComponent {
    readonly item = input.required<FuseNavigationItem>();
    readonly level = input(0);
    readonly navigate = output<void>();

    readonly expanded = signal(false);

    isHidden(item: FuseNavigationItem): boolean {
        return item.hidden ? item.hidden(item) : false;
    }

    toggle(): void {
        this.expanded.update(value => !value);
    }

    onNavigate(): void {
        this.navigate.emit();
    }

    hasImage(): boolean {
        return !!this.item()?.image?.trim();
    }

    itemInitial(): string {
        return this.item()?.title?.charAt(0)?.toUpperCase() ?? '';
    }

    onImageError(event: Event): void {
        (event.target as HTMLImageElement).style.display = 'none';
    }

    trackByFn(index: number, item: FuseNavigationItem): any {
        return item.id || index;
    }
}
