import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FuseNavigationItem } from '@fuse/components/navigation';
import { SimpleNavItemComponent } from './simple-nav-item.component';

@Component({
    selector: 'simple-nav',
    templateUrl: './simple-nav.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'flex flex-1 flex-col min-h-0'
    },
    imports: [SimpleNavItemComponent]
})
export class SimpleNavComponent {
    readonly items = input<FuseNavigationItem[]>([]);
    readonly navigate = output<void>();

    onNavigate(): void {
        this.navigate.emit();
    }

    trackByFn(index: number, item: FuseNavigationItem): any {
        return item.id || index;
    }
}
