import { enableProdMode, provideZoneChangeDetection, ErrorHandler, importProvidersFrom } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import 'swiper/element/bundle';
import { environment } from 'environments/environment';

import { ErrorHandlerService } from './app/shared/error-handler.service';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { TokenInterceptor } from './app/shared/token.interceptor';
import { HttpErrorInterceptor } from './app/shared/error.interceptor';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, ExtraOptions } from '@angular/router';
import { appRoutes } from 'app/app.routing';
import { FuseModule } from '@fuse';
import { FuseConfigModule } from '@fuse/services/config';
import { appConfig } from 'app/core/config/app.config';
import { CoreModule } from 'app/core/core.module';
import { LayoutModule } from 'app/layout/layout.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { AppComponent } from './app/app.component';

const routerConfig: ExtraOptions = {
  scrollPositionRestoration: 'enabled',
  useHash: false,
  anchorScrolling: 'enabled',
  onSameUrlNavigation: 'reload'
};



if ( environment.production )
{
    enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(CommonModule, BrowserModule, BrowserAnimationsModule, RouterModule.forRoot(appRoutes, routerConfig), 
        // Fuse, FuseConfig & FuseMockAPI
        FuseModule, FuseConfigModule.forRoot(appConfig), 
        // Core module of your application
        CoreModule, 
        // Layout module of your application
        LayoutModule, ReactiveFormsModule, FormsModule, DragDropModule, HttpClientModule, MatDatepickerModule, MatNativeDateModule, MatDialogModule, MatSidenavModule, MatFormFieldModule, MatIconModule, MatInputModule, MatMenuModule, MatButtonModule),
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
    ]
})
                        .catch(err => console.error(err));
