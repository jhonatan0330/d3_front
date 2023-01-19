import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { SharedMaterialModule } from 'app/shared/shared-material.module';
import { crudsRoutes } from './cruds.routing';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { FuseScrollResetModule } from '@fuse/directives/scroll-reset';
import { FuseScrollbarModule } from '@fuse/directives/scrollbar';
import { FuseNavigationModule } from '@fuse/components/navigation';
import { FuseFindByKeyPipeModule } from '@fuse/pipes/find-by-key';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CrudsComponent } from './cruds.component';
import { CrudsListComponent } from './list/list.component';
import { CrudsSidebarComponent } from './sidebar/sidebar.component';



@NgModule({
    declarations: [
        CrudsComponent,
        CrudsListComponent,
        CrudsSidebarComponent
    ],
    imports: [
        RouterModule.forChild(crudsRoutes),
        SharedModule,
        SharedMaterialModule,
        MatButtonModule,
        MatCheckboxModule,
        MatDialogModule,
        MatDividerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatProgressBarModule,
        MatSelectModule,
        MatSidenavModule,
        FuseFindByKeyPipeModule,
        FuseNavigationModule,
        FuseScrollbarModule,
        FuseScrollResetModule,
        SharedModule
    ]
})
export class CrudsModule {
}
