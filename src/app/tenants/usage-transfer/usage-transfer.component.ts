import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { DropdownComponent } from 'app/shared/components/dropdown/dropdown/dropdown.component';
import { DropdownItemComponent } from 'app/shared/components/dropdown/dropdown-item/dropdown-item.component';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';
import { TenantsService } from 'app/tenants/tenants.service';
import { SaldoConsumoDTO } from 'app/tenants/tenants.types';

export interface UsageTransferData {
    tenantKey: string;
    tenantName: string;
}

@Component({
    selector: 'usage-transfer',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule, DropdownComponent, DropdownItemComponent],
    templateUrl: './usage-transfer.component.html',
})
export class UsageTransferComponent implements OnInit {
    private notificationCenter = inject(NotificationCenterService);
    public dialogRef = inject<MatDialogRef<UsageTransferComponent>>(MatDialogRef);
    public data = inject<UsageTransferData>(MAT_DIALOG_DATA);
    private service = inject(TenantsService);

    cantidad: number | null = null;
    unidad = 'MB';
    referencia = '';
    cargando = false;
    saldoDestino = signal<SaldoConsumoDTO | null>(null);

    ngOnInit(): void {
        this.service.balanceHijo(this.data.tenantKey).subscribe({ next: (s) => this.saldoDestino.set(s), error: () => { } });
    }

    elegirUnidad(u: string): void {
        this.unidad = u;
    }

    onSubmit(): void {
        if (this.cantidad === null || this.cantidad <= 0) return;
        this.cargando = true;
        this.service.transferir({
            tenantDestino: this.data.tenantKey,
            cantidad: this.cantidad,
            unidad: this.unidad,
            referencia: this.referencia.trim() ? this.referencia.trim() : undefined,
        }).subscribe({
            next: (result) => {
                this.cargando = false;
                this.notificationCenter.fire('Éxito', `Transferencia registrada (${result.referencia})`, 'success');
                this.dialogRef.close(result);
            },
            error: () => { this.cargando = false; }
        });
    }
}
