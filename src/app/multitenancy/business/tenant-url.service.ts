import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TenantUrlService {
    private readonly prefixSignal = signal('');

    get prefix(): string {
        return this.prefixSignal();
    }

    setPrefix(prefix: string): void {
        const value = prefix?.trim() || '';
        if (!value) {
            this.prefixSignal.set('');
            return;
        }
        this.prefixSignal.set('/' + value.replace(/\/+/g, '/').replace(/^\/+|\/+$/g, ''));
    }
}