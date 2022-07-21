import { NgModule, ErrorHandler } from '@angular/core';
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
import { CrudsComponent } from './cruds/cruds.component';
import { FormComponent } from './form/form.component';
import { TemplateComponent } from './main/render/template/template.component';
import { ArchivoComponent } from './form/controls/archivo/archivo.component';
import { BinarioComponent } from './form/controls/binario/binario.component';
import { ConfiguracionComponent } from './form/controls/configuracion/configuracion.component';
import { CroquisComponent } from './form/controls/croquis/croquis.component';
import { DetalleComponent } from './form/controls/detalle/detalle.component';
import { DisponibilidadComponent } from './form/controls/disponibilidad/disponibilidad.component';
import { FechaComponent } from './form/controls/fecha/fecha.component';
import { NumeroComponent } from './form/controls/numero/numero.component';
import { ProcesoComponent } from './form/controls/proceso/proceso.component';
import { ProductoListaComponent } from './form/controls/producto-lista/producto-lista.component';
import { SeccionComponent } from './form/controls/seccion/seccion.component';
import { TextoComponent } from './form/controls/texto/texto.component';
import { BaseComponent } from './form/controls/base/base.component';
import { MassiveComponent } from './form/massive/massive.component';
import { ProductComponent } from './form/controls/detalle/product/product.component';
import { CatalogComponent } from './form/catalog/catalog.component';
import { GpsComponent } from './form/controls/gps/gps.component';
import { OlMapComponent } from './form/controls/gps/ol-map/ol-map.component';
import { SharedModule } from 'app/shared/shared.module';


@NgModule({
  imports: [
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
    ArchivoComponent,
    BinarioComponent,
    ConfiguracionComponent,
    CroquisComponent,
    DetalleComponent,
    DisponibilidadComponent,
    FechaComponent,
    NumeroComponent,
    ProcesoComponent,
    ProductoListaComponent,
    SeccionComponent,
    TextoComponent,
    BaseComponent,
    MassiveComponent,
    //ConfigComponent,
    //VotarComponent,
    ProductComponent,
    //CalendarComponent,
    CatalogComponent,
    GpsComponent,
    OlMapComponent,
    //HelpFaqComponent
  ]
})
export class BpmModule { }
