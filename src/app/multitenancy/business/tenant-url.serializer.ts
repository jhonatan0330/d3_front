import { DefaultUrlSerializer, UrlSerializer, UrlTree } from '@angular/router';
import { TenantUrlService } from 'app/multitenancy/business/tenant-url.service';

export class TenantUrlSerializer implements UrlSerializer {
    private readonly serializer = new DefaultUrlSerializer();

    constructor(private readonly tenantUrl: TenantUrlService) {}

    parse(url: string): UrlTree {
        const prefix = this.tenantUrl.prefix;
        if (!prefix || !this.hasPrefix(url, prefix)) {
            return this.serializer.parse(url);
        }

        const rest = url.slice(prefix.length);
        return this.serializer.parse(rest ? this.ensurePath(rest) : '/');
    }

    serialize(tree: UrlTree): string {
        const url = this.serializer.serialize(tree);
        const prefix = this.tenantUrl.prefix;
        if (!prefix || this.hasPrefix(url, prefix)) {
            return url;
        }

        return url === '/' ? prefix : prefix + url;
    }

    private hasPrefix(url: string, prefix: string): boolean {
        return url === prefix
            || url.startsWith(prefix + '/')
            || url.startsWith(prefix + '?')
            || url.startsWith(prefix + '#');
    }

    private ensurePath(url: string): string {
        return url.startsWith('?') || url.startsWith('#') ? '/' + url : url;
    }
}
