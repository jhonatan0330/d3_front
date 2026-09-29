export function normalizeManifestTenant(tenantId: string | null | undefined): string {
    const tenant = (tenantId || 'default').replace(/^\/+|\/+$/g, '').replace(/\/{2,}/g, '/');
    return tenant || 'default';
}

export function manifestHrefFor(baseUrl: string, tenantId: string | null | undefined): string {
    const base = (baseUrl || window.location.origin).replace(/\/+$/, '');
    const origin = encodeURIComponent(window.location.origin);
    return `${base}/multi-tenancy/manifest/${normalizeManifestTenant(tenantId)}?origin=${origin}`;
}

export function tenantIconHrefFor(
    baseUrl: string,
    tenantId: string | null | undefined,
    size: 192 | 512 = 192
): string {
    const base = (baseUrl || window.location.origin).replace(/\/+$/, '');
    return `${base}/multi-tenancy/icon/${size}/${normalizeManifestTenant(tenantId)}`;
}

export function applyTenantManifest(baseUrl: string, tenantId: string | null | undefined): void {
    const href = manifestHrefFor(baseUrl, tenantId);
    let link = document.querySelector<HTMLLinkElement>("link[rel='manifest']");
    if (!link) {
        link = document.createElement('link');
        link.rel = 'manifest';
        document.head.appendChild(link);
    }
    if (link.getAttribute('href') !== href) {
        link.setAttribute('href', href);
    }
    const iconHref = tenantIconHrefFor(baseUrl, tenantId, 192);
    let apple = document.querySelector<HTMLLinkElement>("link[rel='apple-touch-icon']");
    if (!apple) {
        apple = document.createElement('link');
        apple.rel = 'apple-touch-icon';
        document.head.appendChild(apple);
    }
    if (apple.getAttribute('href') !== iconHref) {
        apple.setAttribute('href', iconHref);
    }
}
