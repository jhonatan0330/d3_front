import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImageFormatPipe } from './pipes/local-image';

import { SharedPipesModule } from './pipes/shared-pipes.module';
import { SharedDirectivesModule } from './directives/shared-directives.module';
import { AuthenticationService } from 'app/authentication/authentication.service';
import { InventoryService } from 'app/inventory/inventory.service';


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
    AuthenticationService,
    InventoryService
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
