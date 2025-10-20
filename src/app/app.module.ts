import { ErrorHandler, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ExtraOptions, PreloadAllModules, RouterModule } from '@angular/router';
import { FuseModule } from '@fuse';
import { FuseConfigModule } from '@fuse/services/config';
import { CoreModule } from 'app/core/core.module';
import { appConfig } from 'app/core/config/app.config';
import { LayoutModule } from 'app/layout/layout.module';
import { AppComponent } from 'app/app.component';
import { appRoutes } from 'app/app.routing';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpErrorInterceptor } from './shared/error.interceptor';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { SharedModule } from './shared/shared.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from '@angular/material/form-field';
import { ErrorHandlerService } from './shared/error-handler.service';
import { TokenInterceptor } from './shared/token.interceptor';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { SignInSplitScreenReversedComponent } from './authentication/sign-in/split-screen-reversed/sign-in.component';

import { MatSidenavModule } from '@angular/material/sidenav';
import { PersonsComponent } from './persons/persons';
import { ContactsDetailsComponent } from './persons/detail_persons/detail_persons';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ChangePictureComponent } from './authentication/settings/change-picture/change-picture.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { SettingsSecurityComponent } from './authentication/settings/security/security.component';
import { IndicatorsComponent } from './indicators/indicatorsPag/indicators.component';


const routerConfig: ExtraOptions = {
  preloadingStrategy: PreloadAllModules,
  scrollPositionRestoration: 'enabled',
  useHash: false,
  anchorScrolling: 'enabled',
  onSameUrlNavigation: 'reload'
};

@NgModule({
  declarations: [
    AppComponent,
    SignInSplitScreenReversedComponent,
    PersonsComponent,            
    ContactsDetailsComponent,
    SettingsSecurityComponent,
    ChangePictureComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(appRoutes, routerConfig),

    // Fuse, FuseConfig & FuseMockAPI
    FuseModule,
    FuseConfigModule.forRoot(appConfig),

    // Core module of your application
    CoreModule,
    // Layout module of your application
    LayoutModule,

    // 3rd party modules that require global configuration via forRoot
    SharedModule,

    ReactiveFormsModule,
    FormsModule,
    DragDropModule,

    HttpClientModule,

    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,

    MatSidenavModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatButtonModule,
    IndicatorsComponent   
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
    { provide: MAT_DATE_LOCALE, useValue: 'en-ZA' },
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
