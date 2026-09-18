import { DefaultUrlSerializer, UrlHandlingStrategy, UrlTree } from '@angular/router';
import { TenantUrlService } from 'app/multitenancy/tenant-url.service';

export interface TenantResolveResult {
    tenantId: string;
    rest: string;
}

/**
 * Mantiene el prefijo de tenant (ej: "/bytec/pioexpress") visible en la URL del
 * navegador. El Router trabaja internamente con la ruta "limpia"; extract
 * elimina el prefijo de la URL del navegador y merge lo vuelve a anteponer en
 * cada navegación.
 */
export class TenantUrlHandlingStrategy extends UrlHandlingStrategy {
    private readonly serializer = new DefaultUrlSerializer();

    constructor(private tenantUrl: TenantUrlService) {
        super();
    }

    shouldProcessUrl(url: UrlTree): boolean {
        return true;
    }

    extract(url: UrlTree): UrlTree {
        const prefix = this.tenantUrl.prefix;
        if (!prefix) {
            return url;
        }
        const full = this.serializer.serialize(url);
        if (full === prefix) {
            return this.serializer.parse('/');
        }
        if (full.startsWith(prefix + '/')) {
            return this.serializer.parse(full.substring(prefix.length));
        }
        if (full.startsWith(prefix + '?')) {
            return this.serializer.parse(full.substring(prefix.length));
        }
        return url;
    }

    merge(newUrlPart: UrlTree, wholeUrl: UrlTree): UrlTree {
        const prefix = this.tenantUrl.prefix;
        if (!prefix) {
            return newUrlPart;
        }
        const part = this.serializer.serialize(newUrlPart);
        const merged = part === '/' ? prefix : prefix + part;
        return this.serializer.parse(merged);
    }
}

/**
 * Consulta {@code GET /multi-tenancy/resolve?path=...} para saber si el path del
 * navegador comienza con un prefijo de tenant y cuál es el límite del prefijo.
 */
export function resolveTenantFromUrl(baseUrl: string, path: string): Promise<TenantResolveResult | null> {
    const base = (baseUrl || window.location.origin).replace(/\/+$/, '');
    const url = `${base}/multi-tenancy/resolve?path=${encodeURIComponent(path)}`;
    return fetch(url)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
            if (data && typeof data.tenantId === 'string' && data.tenantId) {
                return { tenantId: data.tenantId, rest: data.rest ?? '' } as TenantResolveResult;
            }
            return null;
        })
        .catch(() => null);
}