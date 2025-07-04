import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImageFormatPipe } from './local-image';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
  ],
  declarations:[
    ImageFormatPipe
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ImageFormatPipe
  ]
})
export class SharedModule {
}
