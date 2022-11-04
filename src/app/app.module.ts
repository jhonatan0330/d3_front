import { ErrorHandler, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ExtraOptions, PreloadAllModules, RouterModule } from '@angular/router';
//import { MarkdownModule } from 'ngx-markdown';
import { FuseModule } from '@fuse';
import { FuseConfigModule } from '@fuse/services/config';
import { FuseMockApiModule } from '@fuse/lib/mock-api';
import { CoreModule } from 'app/core/core.module';
import { appConfig } from 'app/core/config/app.config';
import { mockApiServices } from 'app/mock-api';
import { LayoutModule } from 'app/layout/layout.module';
import { AppComponent } from 'app/app.component';
import { appRoutes } from 'app/app.routing';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpErrorInterceptor } from './shared/interceptors/error.interceptor';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { ErrorHandlerService } from './shared/services/error-handler.service';
import { SharedModule } from './shared/shared.module';
import { SharedMaterialModule } from './shared/shared-material.module';
import { TextoComponent } from 'app/views/form/controls/texto/texto.component';
import { ArchivoComponent } from './views/form/controls/archivo/archivo.component';
import { BinarioComponent } from 'app/views/form/controls/binario/binario.component';
import { ConfiguracionComponent } from 'app/views/form/controls/configuracion/configuracion.component';
import { CroquisComponent } from 'app/views/form/controls/croquis/croquis.component';
import { DetalleComponent } from 'app/views/form/controls/detalle/detalle.component';
import { DisponibilidadComponent } from 'app/views/form/controls/disponibilidad/disponibilidad.component';
import { FechaComponent } from 'app/views/form/controls/fecha/fecha.component';
import { NumeroComponent } from 'app/views/form/controls/numero/numero.component';
import { ProcesoComponent } from 'app/views/form/controls/proceso/proceso.component';
import { ProductoListaComponent } from 'app/views/form/controls/producto-lista/producto-lista.component';
import { SeccionComponent } from 'app/views/form/controls/seccion/seccion.component';
import { BaseComponent } from 'app/views/form/controls/base/base.component';
import { MassiveComponent } from './views/form/massive/massive.component';
import { ProductComponent } from 'app/views/form/controls/detalle/product/product.component';
import { CatalogComponent } from 'app/views/form/catalog/catalog.component';
import { GpsComponent } from 'app/views/form/controls/gps/gps.component';
import { TemplateComponent } from 'app/views/main/render/template/template.component';
import { FormComponent } from './views/form/form.component';
import { CrudsComponent } from './views/cruds/cruds.component';
import { MainComponent } from 'app/views/main/main.component';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { SignaturePadModule } from 'angular2-signaturepad';
import { NgxCurrencyModule } from 'ngx-currency';
import { NgxMatDatetimePickerModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TokenInterceptor } from './shared/interceptors/token.interceptor';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { ChartsModule } from 'ng2-charts';
import { ChangePictureComponent } from './views/sessions/change-picture/change-picture.component';
import { ChangePwdComponent } from './views/sessions/change-pwd/change-pwd.component';
import { HelpFaqComponent } from './views/help-faq/help-faq.component';
import { ConfigComponent } from './views/survey/config/config.component';
import { VotarComponent } from './views/survey/votar/votar.component';
import { IndicatorsComponent } from './views/main/indicators/indicators.component';

const routerConfig: ExtraOptions = {
  preloadingStrategy: PreloadAllModules,
  scrollPositionRestoration: 'enabled'
};

@NgModule({
  declarations: [
    AppComponent,
    TextoComponent,
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
    BaseComponent,
    MassiveComponent,
    ProductComponent,
    CatalogComponent,
    GpsComponent,
    AppComponent,
    MainComponent,
    CrudsComponent,
    FormComponent,
    TemplateComponent,
    ChangePictureComponent,
    ChangePwdComponent,
    HelpFaqComponent,
    ConfigComponent,
    VotarComponent,
    IndicatorsComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(appRoutes, routerConfig),

    // Fuse, FuseConfig & FuseMockAPI
    FuseModule,
    FuseConfigModule.forRoot(appConfig),
    FuseMockApiModule.forRoot(mockApiServices),

    // Core module of your application
    CoreModule,
    FlexLayoutModule,
    // Layout module of your application
    LayoutModule,

    // 3rd party modules that require global configuration via forRoot
    SharedModule,
    SharedMaterialModule,

    ReactiveFormsModule,
    FormsModule,
    DragDropModule,

    NgxMatTimepickerModule,
    NgxMatDatetimePickerModule,
    NgxCurrencyModule,
    SignaturePadModule,
    ZXingScannerModule,

    BrowserModule,
    BrowserAnimationsModule,
    SharedModule,
    SharedMaterialModule,
    HttpClientModule,
    ChartsModule,
  ],
  providers: [
    { provide: ErrorHandler, useClass: ErrorHandlerService },
    // REQUIRED IF YOU USE JWT AUTHENTICATION
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    }, {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true,
    },
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    {

      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {
        appearance: 'outline'
      }
    }
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule {
}
