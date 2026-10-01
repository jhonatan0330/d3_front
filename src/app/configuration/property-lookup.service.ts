import { Injectable, inject } from '@angular/core';
import { Observable, catchError, shareReplay, throwError } from 'rxjs';
import { PropiedadValorDefinidoDTO } from 'app/shared/shared.domain';
import { RolAccesoFilterDTO } from 'app/authentication/domain/RolAccesoFilterDTO';
import { PropertyService, PropertyValueService } from 'app/configuration/configuracion.api';

@Injectable({ providedIn: 'root' })
export class PropertyLookupService {
    private propertyService = inject(PropertyService);
    private propertyValueService = inject(PropertyValueService);

    private roles$?: Observable<RolAccesoFilterDTO[]>;
    private valoresByOrigen = new Map<string, Observable<PropiedadValorDefinidoDTO[]>>();

    getRoles(): Observable<RolAccesoFilterDTO[]> {
        if (!this.roles$) {
            this.roles$ = this.propertyService.getRoles().pipe(
                shareReplay({ bufferSize: 1, refCount: false }),
                catchError((err) => {
                    this.roles$ = undefined;
                    return throwError(() => err);
                })
            );
        }
        return this.roles$;
    }

    getByOrigen(origen: string, origenCategoria?: string): Observable<PropiedadValorDefinidoDTO[]> {
        const key = `${origen}|${origenCategoria || ''}`;
        const cached = this.valoresByOrigen.get(key);
        if (cached) {
            return cached;
        }
        const request$ = this.propertyValueService.getByOrigen(origen, origenCategoria).pipe(
            shareReplay({ bufferSize: 1, refCount: false }),
            catchError((err) => {
                this.valoresByOrigen.delete(key);
                return throwError(() => err);
            })
        );
        this.valoresByOrigen.set(key, request$);
        return request$;
    }

    preload(origen: string, origenCategoria?: string): void {
        this.getRoles().subscribe({ error: () => undefined });
        this.getByOrigen(origen, origenCategoria).subscribe({ error: () => undefined });
    }

    clearRoles(): void {
        this.roles$ = undefined;
    }

    clearValores(origen?: string, origenCategoria?: string): void {
        if (origen === undefined) {
            this.valoresByOrigen.clear();
            return;
        }
        this.valoresByOrigen.delete(`${origen}|${origenCategoria || ''}`);
    }

    clearAll(): void {
        this.clearRoles();
        this.valoresByOrigen.clear();
    }
}
