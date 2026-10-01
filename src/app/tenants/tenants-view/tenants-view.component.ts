import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DropdownComponent } from 'app/shared/components/dropdown/dropdown/dropdown.component';
import { DropdownItemComponent } from 'app/shared/components/dropdown/dropdown-item/dropdown-item.component';
import { LayoutService } from 'app/layout/layout.service';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';
import { TenantsService } from 'app/tenants/tenants.service';
import { TenantDTO } from 'app/tenants/tenants.types';
import { TenantFormComponent } from 'app/tenants/tenant-form/tenant-form.component';
import { TenantUsuariosComponent } from 'app/tenants/tenant-usuarios/tenant-usuarios.component';
import { UsageDetailComponent } from 'app/tenants/usage-detail/usage-detail.component';
import { UsageTransferComponent } from 'app/tenants/usage-transfer/usage-transfer.component';

@Component({
    selector: 'tenants-view',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, DropdownComponent, DropdownItemComponent],
    templateUrl: './tenants-view.component.html',
})
export class TenantsViewComponent implements OnInit {
    private layoutService = inject(LayoutService);
    private router = inject(Router);
    private service = inject(TenantsService);
    private dialog = inject(MatDialog);
    private notificationCenter = inject(NotificationCenterService);

    loading = signal(false);
    tenants = signal<TenantDTO[]>([]);

    filtroNombre = '';
    filtroEstado = '';

    ngOnInit(): void {
        if (!this.layoutService.validateAccessModule('tenants')) {
            this.router.navigate(['/main']);
            return;
        }
        this.reload();
    }

    reload(): void {
        this.loading.set(true);
        this.service.misSubtenants().subscribe({
            next: (res) => {
                this.tenants.set(res ?? []);
                this.loading.set(false);
            },
            error: () => this.loading.set(false)
        });
    }

    filtrados(): TenantDTO[] {
        const nombre = this.filtroNombre.trim().toLowerCase();
        return this.tenants().filter((t) => {
            if (this.filtroEstado && t.state !== this.filtroEstado) return false;
            if (nombre && !((t.name ?? '').toLowerCase().includes(nombre) || (t.codigo ?? '').toLowerCase().includes(nombre))) return false;
            return true;
        });
    }

    vencido(item: TenantDTO): boolean {
        if (item.state === 'I') return true;
        if (!item.fechaValidez) return false;
        const hoy = new Date().toISOString().slice(0, 10);
        return item.fechaValidez.slice(0, 10) < hoy;
    }

    openForm(item?: TenantDTO): void {
        const dialogRef = this.dialog.open(TenantFormComponent, { disableClose: true, width: '700px', maxWidth: '90vw', data: item ? { ...item } : null });
        dialogRef.afterClosed().subscribe((result: TenantDTO) => { if (result) this.reload(); });
    }

    openUsuarios(item: TenantDTO): void {
        this.dialog.open(TenantUsuariosComponent, { disableClose: true, width: '600px', maxWidth: '90vw', data: { tenantKey: item.key, tenantName: item.name } });
    }

    openUsage(item?: TenantDTO): void {
        this.dialog.open(UsageDetailComponent, {
            disableClose: true, width: '900px', maxWidth: '95vw', maxHeight: '90vh',
            data: item ? { tenantKey: item.key, tenantName: item.name, propio: false } : { tenantName: 'Mi consumo', propio: true }
        });
    }

    openTransfer(item: TenantDTO): void {
        const dialogRef = this.dialog.open(UsageTransferComponent, { disableClose: true, width: '500px', maxWidth: '90vw', data: { tenantKey: item.key, tenantName: item.name } });
        dialogRef.afterClosed().subscribe((result) => { if (result) this.reload(); });
    }

    bloquear(item: TenantDTO): void {
        const accion = item.state === 'A' ? 'bloquear' : 'desbloquear';
        this.notificationCenter.fire({ title: `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} subtenant?`, icon: 'question', showCancelButton: true, confirmButtonText: 'Sí', cancelButtonText: 'Cancelar' })
            .then((result) => {
                if (result.isConfirmed) {
                    this.service.actualizarTenant(item.key, { state: item.state === 'A' ? 'I' : 'A' }).subscribe({
                        next: () => { this.notificationCenter.fire('Éxito', `Subtenant ${accion}do correctamente`, 'success'); this.reload(); }
                    });
                }
            });
    }
}
