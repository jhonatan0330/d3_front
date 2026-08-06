import { NgModule } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { MassiveComponent } from './massive.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: ':template',
                component: MassiveComponent
            },
            {
                path: ':template/:server',
                component: MassiveComponent
            }
        ]),
        MatFormFieldModule,
        MatInputModule,
        MatProgressBarModule,
        MatIconModule,
        MatButtonModule,
        MatTableModule,
        SharedModule,
        MassiveComponent
    ],
    exports: [
        MassiveComponent
    ]
})
export class MassiveModule
{
}
