export interface TenantResolveResult {
    tenantId: string;
    rest: string;
    prefix?: string;
}

export interface TenantSlugSource {
    key: string;
    name: string;
    defecto?: boolean;
}

/**
 * Indica si el tenant es la entrada por defecto (flag del backend o key
 * histórica "default"). El por defecto no lleva prefijo URL ni header
 * X-Tenant-ID.
 */
export function isDefaultTenant(tenant: TenantSlugSource | null | undefined): boolean {
    return !!tenant && (tenant.defecto === true || tenant.key === 'default');
}

/**
 * Slug URL a partir del nombre del tenant ("Pío Express" → "pio-express").
 */
export function slugifyTenantName(name: string): string {
    return (name || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[\s_]+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Prefijo URL para un tenant: slug del nombre, salvo el por defecto que no
 * lleva prefijo. Si el nombre no slugifica, se usa el key como respaldo.
 */
export function prefixForTenant(tenant: TenantSlugSource | null | undefined): string {
    if (isDefaultTenant(tenant)) {
        return '';
    }
    return slugifyTenantName(tenant!.name) || tenant!.key;
}

/**
 * Resuelve el primer segmento del path contra los slugs de los tenants
 * conocidos, sin llamar al backend. Retorna null si no hay coincidencia.
 */
export function resolveTenantSlug(tenants: TenantSlugSource[], path: string): TenantResolveResult | null {
    const segments = path.split('/').filter(Boolean);
    if (!segments.length) {
        return null;
    }
    const slug = segments[0].toLowerCase();
    if (!slug) {
        return null;
    }
    const match = tenants.find(tenant =>
        !isDefaultTenant(tenant)
        && !!slugifyTenantName(tenant.name)
        && slugifyTenantName(tenant.name) === slug
    );
    if (!match) {
        return null;
    }
    return {
        tenantId: match.key,
        rest: '/' + segments.slice(1).join('/'),
        prefix: '/' + segments[0]
    };
}

/**
 * Quita el primer segmento del path si es el slug de un tenant conocido o el
 * prefijo actual. Conserva query/hash.
 */
export function stripTenantPrefix(url: string, tenants: TenantSlugSource[], currentPrefix: string): string {
    if (!url) {
        return url;
    }
    const cut = url.search(/[#?]/);
    const path = cut < 0 ? url : url.slice(0, cut);
    const suffix = cut < 0 ? '' : url.slice(cut);
    const segments = path.split('/').filter(Boolean);
    if (!segments.length) {
        return url;
    }
    const first = segments[0].toLowerCase();
    const isSlug = !!first && tenants.some(tenant =>
        !isDefaultTenant(tenant) && slugifyTenantName(tenant.name) === first
    );
    const prefixSegment = (currentPrefix || '').split('/').filter(Boolean)[0]?.toLowerCase();
    if (isSlug || (prefixSegment && first === prefixSegment)) {
        return '/' + segments.slice(1).join('/') + suffix;
    }
    return url;
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