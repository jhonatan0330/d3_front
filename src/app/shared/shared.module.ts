import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImageFormatPipe } from './pipes/local-image';
// SERVICES
import { ThemeService } from './services/theme.service';
import { NavigationService } from './services/navigation.service';
import { AuthGuard } from './guards/auth.guard';
import { UserRoleGuard } from './guards/user-role.guard';

import { SharedComponentsModule } from './components/shared-components.module';
import { SharedPipesModule } from './pipes/shared-pipes.module';
import { SharedDirectivesModule } from './directives/shared-directives.module';


@NgModule({
  imports: [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
    SharedComponentsModule,
    SharedPipesModule,
    SharedDirectivesModule
  ],
  providers: [
    ImageFormatPipe,
    ThemeService,
    NavigationService,
    AuthGuard,
    UserRoleGuard
  ],
  exports: [
    CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ImageFormatPipe,
    SharedComponentsModule,
    SharedPipesModule,
    SharedDirectivesModule
  ]
})
export class SharedModule 
{ 
}
