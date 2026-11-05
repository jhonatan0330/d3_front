import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { UsageService } from 'app/usage/business/usage.service';

@Component({
    selector: 'usage-meter-widget',
    standalone: true,
    imports: [MatIcon],
    templateUrl: './usage-meter-widget.component.html',
})
export class UsageMeterWidgetComponent implements OnInit {

    readonly usage = inject(UsageService);
    private readonly router = inject(Router);

    ngOnInit(): void {
        this.usage.loadResumen();
    }

    abrirMedidor(): void {
        this.router.navigate(['/usage']);
    }
}
