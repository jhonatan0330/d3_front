import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutService } from 'app/layout/layout.service';
import { UsageService } from 'app/usage/business/usage.service';
import { MovimientoConsumoFilterDTO } from 'app/usage/domain/usage.domain';

interface TendenciaDia {
    clave: string;
    etiqueta: string;
    total: number;
}

@Component({
    selector: 'usage-view',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './usage-view.component.html',
})
export class UsageViewComponent implements OnInit {

    readonly usage = inject(UsageService);
    readonly layoutService = inject(LayoutService);

    readonly desde = signal<string>(this.primerDiaMes());
    readonly hasta = signal<string>(this.hoy());

    readonly saldo = this.usage.saldo;
    readonly consumoHoy = this.usage.consumoHoy;
    readonly consumoMes = this.usage.consumoMes;
    readonly porcentajeConsumo = this.usage.porcentajeConsumo;
    readonly movimientos = this.usage.movimientos;
    readonly cargando = this.usage.cargando;

    readonly empresa = computed(() => this.layoutService.company()?.nombre ?? '');

    readonly tendencia = computed<TendenciaDia[]>(() => {
        const porDia = new Map<string, TendenciaDia>();
        for (const movimiento of this.movimientos()) {
            if (movimiento.tipo !== 'C' || !(movimiento.fechaEvento instanceof Date)) {
                continue;
            }
            const fecha = movimiento.fechaEvento;
            const clave = this.claveDia(fecha);
            const etiqueta =
                `${String(fecha.getDate()).padStart(2, '0')}/${String(fecha.getMonth() + 1).padStart(2, '0')}`;
            const existente = porDia.get(clave);
            if (existente) {
                existente.total += movimiento.cantidad ?? 0;
            } else {
                porDia.set(clave, { clave, etiqueta, total: movimiento.cantidad ?? 0 });
            }
        }
        return [...porDia.values()].sort((a, b) => a.clave.localeCompare(b.clave));
    });

    readonly maxTendencia = computed(() =>
        this.tendencia().reduce((max, item) => Math.max(max, item.total), 0)
    );

    ngOnInit(): void {
        this.usage.loadResumen();
        this.aplicarFiltro();
    }

    aplicarFiltro(): void {
        const filtro: MovimientoConsumoFilterDTO = {};
        const min = this.parseDiaInicio(this.desde());
        if (min) {
            filtro.fechaEventoMin = min;
        }
        const max = this.parseDiaFin(this.hasta());
        if (max) {
            filtro.fechaEventoMax = max;
        }
        this.usage.loadMovimientos(filtro);
    }

    formatearMB(valor: number | null | undefined): string {
        if (valor == null) {
            return '0';
        }
        return (Math.round(valor * 100) / 100).toString();
    }

    alturaBarra(valor: number): number {
        const maximo = this.maxTendencia();
        if (maximo <= 0) {
            return 0;
        }
        return Math.max(4, (valor / maximo) * 100);
    }

    tipoTexto(tipo: string): string {
        switch (tipo) {
            case 'C': return 'Consumo';
            case 'I': return 'Inicial';
            case 'D': return 'Diario';
            case 'P': return 'Compra';
            case 'T': return 'Transferencia enviada';
            case 'E': return 'Transferencia recibida';
            default: return tipo;
        }
    }

    private parseDiaInicio(valor: string): Date | undefined {
        if (!valor) {
            return undefined;
        }
        const [anio, mes, dia] = valor.split('-').map(Number);
        return new Date(anio, mes - 1, dia);
    }

    private parseDiaFin(valor: string): Date | undefined {
        if (!valor) {
            return undefined;
        }
        const [anio, mes, dia] = valor.split('-').map(Number);
        return new Date(anio, mes - 1, dia + 1);
    }

    private claveDia(fecha: Date): string {
        const anio = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const dia = String(fecha.getDate()).padStart(2, '0');
        return `${anio}-${mes}-${dia}`;
    }

    private primerDiaMes(): string {
        const ahora = new Date();
        const mes = String(ahora.getMonth() + 1).padStart(2, '0');
        return `${ahora.getFullYear()}-${mes}-01`;
    }

    private hoy(): string {
        const ahora = new Date();
        const mes = String(ahora.getMonth() + 1).padStart(2, '0');
        const dia = String(ahora.getDate()).padStart(2, '0');
        return `${ahora.getFullYear()}-${mes}-${dia}`;
    }
}
