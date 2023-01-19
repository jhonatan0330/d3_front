import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'footer',
    templateUrl: './footer.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {
    /**
     * Constructor
     */
    constructor() {
    }

    /**
     * Getter for current year
     */
    get currentYear(): number {
        return new Date().getFullYear();
    }
}
