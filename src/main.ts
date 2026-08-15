import { enableProdMode, provideZonelessChangeDetection, ErrorHandler, importProvidersFrom, provideAppInitializer, inject, isDevMode } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import 'swiper/element/bundle';
import { environment } from 'environments/environment';

import { ErrorHandlerService } from './app/shared/error-handler.service';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { tokenInterceptor } from './app/shared/token.interceptor';
import { httpErrorInterceptor } from './app/shared/error.interceptor';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { provideServiceWorker } from '@angular/service-worker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, ExtraOptions } from '@angular/router';
import { appRoutes } from 'app/app.routing';
import { FuseConfigModule } from 'app/core/config/fuse-config.module';
import { appConfig } from 'app/core/config/app.config';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AppComponent } from './app/app.component';
import { OVERLAY_DEFAULT_CONFIG } from '@angular/cdk/overlay';

function registerIcons(): void {
    const registry = inject(MatIconRegistry);
    const sanitizer = inject(DomSanitizer);
    registry.addSvgIconSetInNamespace('heroicons_outline', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/heroicons-outline.svg'));
}

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
        provideZonelessChangeDetection(),
        provideAppInitializer(registerIcons),
        importProvidersFrom(CommonModule, BrowserModule, BrowserAnimationsModule, RouterModule.forRoot(appRoutes, routerConfig), 
        // FuseConfig
        FuseConfigModule.forRoot(appConfig), 
        ReactiveFormsModule, FormsModule, DragDropModule, MatDatepickerModule, MatNativeDateModule, MatDialogModule, MatSidenavModule, MatFormFieldModule, MatIconModule, MatInputModule),
        provideHttpClient(withInterceptors([tokenInterceptor, httpErrorInterceptor])),
        { provide: ErrorHandler, useClass: ErrorHandlerService },
        {
            provide: OVERLAY_DEFAULT_CONFIG,
            useValue: {
                usePopover: false
            }
        },
        { provide: MAT_DATE_LOCALE, useValue: 'en-ZA' },
        {
            provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
            useValue: {
                appearance: 'outline'
            }
        },
        provideServiceWorker('ngsw-worker.js', { enabled: !isDevMode() })
    ]
})
                        .catch(err => console.error(err));
