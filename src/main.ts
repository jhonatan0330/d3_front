import { enableProdMode, provideZonelessChangeDetection, ErrorHandler, importProvidersFrom, provideAppInitializer, inject, isDevMode } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
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
import { RouterModule, ExtraOptions, UrlHandlingStrategy } from '@angular/router';
import { appRoutes } from 'app/app.routing';
import { FuseConfigModule } from 'app/layout/core/config/fuse-config.module';
import { appConfig } from 'app/layout/core/config/app.config';
import { TenantUrlHandlingStrategy, resolveTenantFromUrl } from 'app/multitenancy/business/tenant-url.strategy';
import { TenantUrlService } from 'app/multitenancy/business/tenant-url.service';
import { LocalStoreService, LocalConstants } from 'app/shared/local-store.service';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';

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

const RESERVED_FIRST_SEGMENTS = new Set([
    'main', 'sign-in', 'sessions', 'list', 'tasks', 'massive', 'account',
    'persons', 'config', 'assets', 'static', 'api', 'document', 'reporte',
    'error', 'multitenancy'
]);

function readLocalStore(): LocalStoreService {
    return new LocalStoreService();
}

async function resolveInitialTenantId(): Promise<string> {
    const path = window.location.pathname;
    const first = path.split('/').find(Boolean)?.toLowerCase() || '';
    if (!first || RESERVED_FIRST_SEGMENTS.has(first)) {
        return '';
    }
    const localStore = readLocalStore();
    const base = localStore.getItem(LocalConstants.URL_CONF) || window.location.origin;
    const result = await resolveTenantFromUrl(base, path + window.location.search);
    return result?.tenantId || '';
}

async function bootstrap(): Promise<void> {
    const tenantUrl = new TenantUrlService();
    const tenantStrategy = new TenantUrlHandlingStrategy(tenantUrl);
    const tenantId = await resolveInitialTenantId();
    const localStore = readLocalStore();
    if (tenantId) {
        localStore.setItem(LocalConstants.TENANT_ID, tenantId);
    } else {
        localStore.setItem(LocalConstants.TENANT_ID, null);
    }
    tenantUrl.setPrefix(tenantId);

    await bootstrapApplication(AppComponent, {
    providers: [
        provideZonelessChangeDetection(),
        provideAppInitializer(registerIcons),
        importProvidersFrom(CommonModule, BrowserModule, BrowserAnimationsModule, RouterModule.forRoot(appRoutes, routerConfig), 
        // FuseConfig
        FuseConfigModule.forRoot(appConfig), 
        ReactiveFormsModule, FormsModule, DragDropModule, MatDatepickerModule, MatNativeDateModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule),
        provideHttpClient(withInterceptors([tokenInterceptor, httpErrorInterceptor])),
        { provide: ErrorHandler, useClass: ErrorHandlerService },
        { provide: UrlHandlingStrategy, useValue: tenantStrategy },
        { provide: TenantUrlService, useValue: tenantUrl },
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
}

bootstrap().catch(err => console.error(err));
