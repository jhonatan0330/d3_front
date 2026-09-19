export interface TenantResolveResult {
    tenantId: string;
    rest: string;
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