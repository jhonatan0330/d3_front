import { Component, ViewEncapsulation, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-home-button',
    templateUrl: './home-button.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatIconButton, MatTooltip, MatIcon]
})
export class HomeButtonComponent {
    private router = inject(Router);


    goToHome(): void {
        this.router.navigate(['/main']);
    }
}
