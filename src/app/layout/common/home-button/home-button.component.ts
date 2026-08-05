import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-home-button',
    templateUrl: './home-button.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class HomeButtonComponent {

    constructor(private router: Router) {}

    goToHome(): void {
        this.router.navigate(['/main']);
    }
}
