import { Component, output, inject, ChangeDetectionStrategy } from '@angular/core';
import { DropdownComponent } from '../dropdown/dropdown.component';

@Component({
    selector: 'app-dropdown-item',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './dropdown-item.component.html'
})
export class DropdownItemComponent {
    private readonly dropdown = inject(DropdownComponent);
    clicked = output<void>();

    onClick(): void {
        this.dropdown.close();
        this.clicked.emit();
    }
}
