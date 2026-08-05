import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { FuseNavigationModule } from '@fuse/components/navigation';
import { NotificationsModule } from 'app/notification/notification.module';
import { SearchModule } from 'app/layout/common/search/search.module';
import { ShortcutsModule } from 'app/layout/common/shortcuts/shortcuts.module';
import { UserModule } from 'app/layout/common/user/user.module';
import { SharedModule } from 'app/shared/shared.module';
import { MaterialLayoutComponent } from 'app/layout/layouts/horizontal/material/material.component';
import { HomeButtonModule } from 'app/layout/common/home-button/home-button.module';

@NgModule({
  declarations: [
    MaterialLayoutComponent
  ],
  imports: [
    HttpClientModule,
    RouterModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatMenuModule,
    FuseNavigationModule,
    NotificationsModule,
    SearchModule,
    ShortcutsModule,
    UserModule,
    SharedModule,
    HomeButtonModule
  ],
  exports: [
    MaterialLayoutComponent
  ]
})
export class MaterialLayoutModule {
}
