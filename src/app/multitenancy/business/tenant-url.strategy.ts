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
 * Prefijo URL para un id de tenant composite ("d3apps/malvar" → "/d3apps/malvar").
 * Preserva los niveles intermedios. Vacío/default → ''.
 */
export function prefixForTenantId(tenantId: string | null | undefined): string {
    const raw = (tenantId || '').trim().replace(/\/+/g, '/').replace(/^\/+|\/+$/g, '');
    if (!raw || raw.toLowerCase() === 'default') {
        return '';
    }
    return '/' + raw;
}

/**
 * Prefijo URL para un tenant: el key composite (multi-nivel, ej: "a/b" →
 * "/a/b"), salvo el por defecto que no lleva prefijo. Solo para tenants de un
 * nivel sin "/" en el key se usa el slug del nombre como presentación, con el
 * key como respaldo.
 */
export function prefixForTenant(tenant: TenantSlugSource | null | undefined): string {
    if (!tenant || isDefaultTenant(tenant)) {
        return '';
    }
    if (tenant.key && tenant.key.includes('/')) {
        return prefixForTenantId(tenant.key);
    }
    return slugifyTenantName(tenant!.name) || tenant!.key;
}

/**
 * Resuelve el prefijo de tenant más largo del path contra los tenants
 * conocidos, sin llamar al backend. Soporta composites multi-nivel
 * ("d3apps/malvar") comparando por key, y tenants de un nivel por slug del
 * nombre. Retorna null si no hay coincidencia.
 */
export function resolveTenantSlug(tenants: TenantSlugSource[], path: string): TenantResolveResult | null {
    const segments = path.split('/').filter(Boolean);
    if (!segments.length) {
        return null;
    }
    const lower = segments.map(s => s.toLowerCase());
    const candidates = (tenants || []).filter(t => !!t && !isDefaultTenant(t));
    const byDepth = [...candidates].sort((a, b) => {
        const da = (a.key || '').split('/').filter(Boolean).length;
        const db = (b.key || '').split('/').filter(Boolean).length;
        return db - da;
    });
    for (const tenant of byDepth) {
        const keySegments = (tenant.key || '').split('/').filter(Boolean);
        if (keySegments.length > 1
            && lower.length >= keySegments.length
            && keySegments.every((segment, index) => segment.toLowerCase() === lower[index])) {
            return {
                tenantId: tenant.key,
                rest: '/' + segments.slice(keySegments.length).join('/'),
                prefix: '/' + segments.slice(0, keySegments.length).join('/')
            };
        }
    }
    const slug = lower[0];
    if (!slug) {
        return null;
    }
    const match = candidates.find(tenant =>
        !!slugifyTenantName(tenant.name)
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
 * Quita el prefijo de tenant de la URL: primero intenta el prefijo actual
 * completo (puede ser multi-nivel, ej: "/a/b"); si no coincide, quita el
 * primer segmento si es el slug de un tenant conocido o el primer segmento
 * del prefijo actual. Conserva query/hash.
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
    const prefixSegments = (currentPrefix || '').split('/').filter(Boolean);
    if (prefixSegments.length > 0
        && segments.length >= prefixSegments.length
        && prefixSegments.every((segment, index) => segments[index].toLowerCase() === segment.toLowerCase())) {
        return '/' + segments.slice(prefixSegments.length).join('/') + suffix;
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