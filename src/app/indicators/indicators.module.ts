import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IndiCardsComponent } from './indi-cards/indi-cards.component';

@NgModule({
    declarations: [
        IndiCardsComponent,
    ],
    imports: [
        CommonModule,
    ],
    exports: [
        IndiCardsComponent,
    ]
})
export class IndicatorsModule { }
