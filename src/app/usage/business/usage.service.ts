import { Injectable, inject, signal, computed } from '@angular/core';
import { finalize } from 'rxjs';
import { UsageApi } from 'app/usage/usage.api';
import { MovimientoConsumoDTO, MovimientoConsumoFilterDTO, SaldoConsumoDTO } from 'app/usage/domain/usage.domain';

const LIMITE_KPI = 2000;

@Injectable({
    providedIn: 'root'
})
export class UsageService {

    private readonly api = inject(UsageApi);

    private readonly _saldo = signal<SaldoConsumoDTO | null>(null);
    private readonly _movimientos = signal<MovimientoConsumoDTO[]>([]);
    private readonly _cargando = signal(false);
    private readonly _consumoHoy = signal(0);
    private readonly _consumoMes = signal(0);

    readonly saldo = this._saldo.asReadonly();
    readonly movimientos = this._movimientos.asReadonly();
    readonly cargando = this._cargando.asReadonly();
    readonly consumoHoy = this._consumoHoy.asReadonly();
    readonly consumoMes = this._consumoMes.asReadonly();

    readonly porcentajeConsumo = computed(() => {
        const mes = this._consumoMes();
        const saldo = this._saldo()?.saldo ?? 0;
        const total = mes + saldo;
        if (total <= 0) {
            return 0;
        }
        return Math.min(100, Math.round((mes / total) * 100));
    });

    loadResumen(): void {
        this.api.balance().subscribe({
            next: (saldo) => this._saldo.set(saldo),
            error: () => { }
        });

        const filtro: MovimientoConsumoFilterDTO = {
            fechaEventoMin: this.inicioMes(),
            tipo: 'C',
            paginacionRegistroFinal: LIMITE_KPI
        };
        this.api.movements(filtro).subscribe({
            next: (movimientos) => {
                const inicioHoy = this.inicioDia();
                let mes = 0;
                let hoy = 0;
                for (const movimiento of movimientos) {
                    const cantidad = movimiento.cantidad ?? 0;
                    mes += cantidad;
                    if (movimiento.fechaEvento instanceof Date && movimiento.fechaEvento >= inicioHoy) {
                        hoy += cantidad;
                    }
                }
                this._consumoMes.set(mes);
                this._consumoHoy.set(hoy);
            },
            error: () => { }
        });
    }

    loadMovimientos(filter?: MovimientoConsumoFilterDTO): void {
        this._cargando.set(true);
        this.api.movements(filter).pipe(
            finalize(() => this._cargando.set(false))
        ).subscribe({
            next: (movimientos) => this._movimientos.set(movimientos ?? []),
            error: () => this._movimientos.set([])
        });
    }

    private inicioMes(): Date {
        const ahora = new Date();
        return new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    }

    private inicioDia(): Date {
        const ahora = new Date();
        return new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    }
}
