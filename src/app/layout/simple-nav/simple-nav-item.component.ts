import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { FuseNavigationItem } from 'app/layout/layout.types';

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

    trackByFn(index: number, item: FuseNavigationItem): any {
        return item.id || index;
    }
}
