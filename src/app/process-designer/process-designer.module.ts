import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Route, RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { CanvasComponent } from './canvas/canvas.component';

export const routes: Route[] = [
    // Overview
    {
        path     : '',
        component: CanvasComponent
    }
];

@NgModule({
    declarations: [
        CanvasComponent,
    ],
    imports     : [
        RouterModule.forChild(routes),
        MatIconModule,
        SharedModule
    ]
})
export class ProcessDesignerModule
{
}
