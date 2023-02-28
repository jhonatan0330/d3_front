import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImageFormatPipe } from './pipes/local-image';
// SERVICES
import { ThemeService } from './services/theme.service';


import { SharedPipesModule } from './pipes/shared-pipes.module';
import { SharedDirectivesModule } from './directives/shared-directives.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedPipesModule,
    SharedDirectivesModule
  ],
  providers: [
    ImageFormatPipe,
    ThemeService
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ImageFormatPipe,
    SharedPipesModule,
    SharedDirectivesModule
  ]
})
export class SharedModule {
}
