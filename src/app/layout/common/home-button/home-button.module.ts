import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from 'app/shared/shared.module';
import { HomeButtonComponent } from './home-button.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
    declarations: [
        HomeButtonComponent
    ],
    imports: [
        RouterModule,
        MatButtonModule,
        MatIconModule,
        SharedModule,
        MatTooltipModule
    ],
    exports: [
        HomeButtonComponent
    ]
})
export class HomeButtonModule {}
