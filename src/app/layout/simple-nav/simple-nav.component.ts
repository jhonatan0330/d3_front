import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { FuseNavigationItem } from 'app/layout/layout.types';
import { SimpleNavItemComponent } from './simple-nav-item.component';

@Component({
    selector: 'simple-nav',
    templateUrl: './simple-nav.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'flex flex-1 flex-col min-h-0'
    },
    imports: [SimpleNavItemComponent, FormsModule, MatIcon]
})
export class SimpleNavComponent {
    readonly items = input<FuseNavigationItem[]>([]);
    readonly navigate = output<void>();

    readonly filter = signal('');

    readonly filteredItems = computed<FuseNavigationItem[]>(() => {
        const query = this.filter().trim().toLowerCase();
        const items = this.items() ?? [];
        if (!query) {
            return items;
        }
        return this._filterItems(items, query);
    });

    onNavigate(): void {
        this.navigate.emit();
    }

    trackByFn(index: number, item: FuseNavigationItem): any {
        return item.id || index;
    }

    onFilterChange(value: string): void {
        this.filter.set(value);
    }

    private _filterItems(items: FuseNavigationItem[], query: string): FuseNavigationItem[] {
        const result: FuseNavigationItem[] = [];
        for (const item of items) {
            const match = (item.title?.toLowerCase().includes(query) ?? false);
            if (item.children?.length) {
                const filteredChildren = this._filterItems(item.children, query);
                if (filteredChildren.length) {
                    result.push({ ...item, children: filteredChildren });
                } else if (match) {
                    result.push(item);
                }
            } else if (match) {
                result.push(item);
            }
        }
        return result;
    }
}
