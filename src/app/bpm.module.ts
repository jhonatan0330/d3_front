import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule , ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DragDropModule } from '@angular/cdk/drag-drop';
//import { NgxMatDatetimePickerModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';

import { bpmRoutes } from './bpm.routing';
import { NgxCurrencyModule } from "ngx-currency";
import { SignaturePadModule } from 'angular2-signaturepad';
import { ZXingScannerModule } from '@zxing/ngx-scanner';

import { HttpClientModule } from '@angular/common/http';
import { SharedMaterialModule } from 'app/shared/shared-material.module';
import { MainComponent } from './main/main.component';
import { CrudsComponent } from '../../../../views/cruds/cruds.component';
import { FormComponent } from '../../../../views/form/form.component';
import { TemplateComponent } from './main/render/template/template.component';

import { SharedModule } from 'app/shared/shared.module';
import { CommonModule } from '@angular/common';


@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    BrowserAnimationsModule,
    DragDropModule,
    SharedModule,
    SharedMaterialModule,
    HttpClientModule,
    //FlexLayoutModule,
    //NgxMatTimepickerModule,
    //NgxMatDatetimePickerModule,
    NgxCurrencyModule,
    SignaturePadModule,
    ZXingScannerModule,
    //ChartsModule,
    RouterModule.forRoot(bpmRoutes)
  ],
  declarations: [
    MainComponent,
    CrudsComponent,
    FormComponent,
    TemplateComponent,
  ]
})
export class BpmModule { }
