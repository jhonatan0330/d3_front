import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'IndicatorsComponent',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './indicators.component.html'
})
export class IndicatorsComponent implements OnInit, OnDestroy {

    constructor() {
    }

    ngOnInit(): void {}

    ngOnDestroy(): void { }


}