import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TenantsService } from 'app/tenants/tenants.service';
import { MovimientoConsumoDTO, SaldoConsumoDTO } from 'app/tenants/tenants.types';

export interface UsageDetailData {
    tenantKey?: string;
    tenantName: string;
    propio: boolean;
}

@Component({
    selector: 'usage-detail',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule],
    templateUrl: './usage-detail.component.html',
})
export class UsageDetailComponent implements OnInit {
    public dialogRef = inject<MatDialogRef<UsageDetailComponent>>(MatDialogRef);
    public data = inject<UsageDetailData>(MAT_DIALOG_DATA);
    private service = inject(TenantsService);

    movimientos = signal<MovimientoConsumoDTO[]>([]);
    saldo = signal<SaldoConsumoDTO | null>(null);
    cargando = signal(false);
    filtroTipo = '';

    ngOnInit(): void {
        this.cargarSaldo();
        this.recargar();
    }

    cargarSaldo(): void {
        const req$ = this.data.propio || !this.data.tenantKey
            ? this.service.balance()
            : this.service.balanceHijo(this.data.tenantKey);
        req$.subscribe({ next: (s) => this.saldo.set(s), error: () => { } });
    }

    recargar(): void {
        this.cargando.set(true);
        const filter = this.filtroTipo ? { tipo: this.filtroTipo } : undefined;
        const req$ = this.data.propio || !this.data.tenantKey
            ? this.service.movements(filter)
            : this.service.movementsHijo(this.data.tenantKey, filter);
        req$.subscribe({
            next: (res) => { this.movimientos.set(res ?? []); this.cargando.set(false); },
            error: () => this.cargando.set(false)
        });
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
}
