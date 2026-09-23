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
import { RouterModule, ExtraOptions, UrlSerializer } from '@angular/router';
import { appRoutes } from 'app/app.routing';
import { FuseConfigModule } from 'app/layout/core/config/fuse-config.module';
import { appConfig } from 'app/layout/core/config/app.config';
import { resolveTenantFromUrl, TenantResolveResult } from 'app/multitenancy/business/tenant-url.strategy';
import { TenantUrlService } from 'app/multitenancy/business/tenant-url.service';
import { TenantUrlSerializer } from 'app/multitenancy/business/tenant-url.serializer';
import { TenantRuntime } from 'app/multitenancy/business/tenant-runtime';
import { LocalStoreService } from 'app/shared/local-store.service';
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

if (environment.production) {
    enableProdMode();
}

const RESERVED_FIRST_SEGMENTS = new Set([
    'main', 'sign-in', 'sessions', 'list', 'tasks', 'massive', 'account',
    'persons', 'config', 'assets', 'static', 'api', 'document', 'reporte',
    'error', 'multitenancy'
]);

async function ensureBaseUrl(localStore: LocalStoreService): Promise<string> {
    const configured = localStore.getUrlConf();
    if (configured) {
        return configured;
    }
    try {
        const response = await fetch('/assets/conf.xml');
        const data = await response.text();
        if (response.ok && data && data !== 'SW42') {
            const baseUrl = data.endsWith('/') ? data.slice(0, -1) : data;
            localStore.setUrlConf(baseUrl);
            return baseUrl;
        }
    } catch {
    }

    localStore.setUrlConf(location.origin);
    return location.origin;
}

async function loadTenants(base: string, localStore: LocalStoreService): Promise<void> {
    const tenantsLocal: TenantRuntime[] = localStore.getTenants();
    try {
        const response = await fetch(`${base}/multi-tenancy`);
        if (response.ok) {
            const list = await response.json();
            const tenants = (Array.isArray(list) ? list : []).map(tenant => ({
                ...tenant, token: tenant?.key ? tenantsLocal?.find(localTenant => localTenant?.key === tenant.key)?.token ?? null
                    : null
            }));
            TenantRuntime.setTenants(tenants);
            localStore.setTenants(tenants);
        } else {
            throw new Error('HTTP ' + response.status);
        }
    } catch {
    }
}

async function resolveInitialTenant(base): Promise<TenantResolveResult | null> {
    const path = window.location.pathname;
    const first = path.split('/').find(Boolean)?.toLowerCase() || '';
    if (!first || RESERVED_FIRST_SEGMENTS.has(first)) {
        TenantRuntime.setCurrent(null);
        return null;
    }
    const result = await resolveTenantFromUrl(base, path + window.location.search);
    const current = result?.tenantId
        ? (TenantRuntime.findByKey(result.tenantId) ?? {  key: result.tenantId, name: result.tenantId, imagen: undefined, token: null })
        : null;
    TenantRuntime.setCurrent(current);
    return result;
}

async function bootstrap(): Promise<void> {
    const tenantUrl = new TenantUrlService();
    const localStore = new LocalStoreService();
    const base = await ensureBaseUrl(localStore);
    await loadTenants(base, localStore);
    const tenantResolution = await resolveInitialTenant(base);
    const tenantId = tenantResolution?.tenantId || '';
    
    tenantUrl.setPrefix(tenantId);

    await bootstrapApplication(AppComponent, {
        providers: [
            provideZonelessChangeDetection(),
            provideAppInitializer(registerIcons),
            importProvidersFrom(CommonModule, BrowserModule, BrowserAnimationsModule, RouterModule.forRoot(appRoutes, routerConfig),
                FuseConfigModule.forRoot(appConfig),
                ReactiveFormsModule, FormsModule, DragDropModule, MatDatepickerModule, MatNativeDateModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule),
            provideHttpClient(withInterceptors([tokenInterceptor, httpErrorInterceptor])),
            { provide: ErrorHandler, useClass: ErrorHandlerService },
            { provide: TenantUrlService, useValue: tenantUrl },
            {
                provide: UrlSerializer,
                useFactory: (service: TenantUrlService) => new TenantUrlSerializer(service),
                deps: [TenantUrlService]
            },
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
