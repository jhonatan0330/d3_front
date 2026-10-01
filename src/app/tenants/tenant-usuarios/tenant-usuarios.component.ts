import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';
import { TenantsService } from 'app/tenants/tenants.service';
import { TenantUsuarioDTO } from 'app/tenants/tenants.types';

export interface TenantUsuariosData {
    tenantKey: string;
    tenantName: string;
}

@Component({
    selector: 'tenant-usuarios',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule],
    templateUrl: './tenant-usuarios.component.html',
})
export class TenantUsuariosComponent implements OnInit {
    private notificationCenter = inject(NotificationCenterService);
    public dialogRef = inject<MatDialogRef<TenantUsuariosComponent>>(MatDialogRef);
    public data = inject<TenantUsuariosData>(MAT_DIALOG_DATA);
    private service = inject(TenantsService);

    usuarios = signal<TenantUsuarioDTO[]>([]);
    cargando = signal(false);
    nuevoUsuario = '';

    ngOnInit(): void {
        this.recargar();
    }

    recargar(): void {
        this.cargando.set(true);
        this.service.listarUsuarios(this.data.tenantKey).subscribe({
            next: (res) => { this.usuarios.set(res ?? []); this.cargando.set(false); },
            error: () => this.cargando.set(false)
        });
    }

    asignar(): void {
        const usuario = this.nuevoUsuario.trim();
        if (!usuario) return;
        this.cargando.set(true);
        this.service.asignarUsuario(this.data.tenantKey, usuario).subscribe({
            next: () => {
                this.cargando.set(false);
                this.nuevoUsuario = '';
                this.notificationCenter.fire('Éxito', 'Usuario asignado correctamente', 'success');
                this.recargar();
            },
            error: () => this.cargando.set(false)
        });
    }

    retirar(item: TenantUsuarioDTO): void {
        this.notificationCenter.fire({ title: '¿Retirar usuario?', icon: 'question', showCancelButton: true, confirmButtonText: 'Sí', cancelButtonText: 'Cancelar' })
            .then((result) => {
                if (result.isConfirmed) {
                    this.service.retirarUsuario(this.data.tenantKey, item.usuario).subscribe({
                        next: () => { this.notificationCenter.fire('Éxito', 'Usuario retirado correctamente', 'success'); this.recargar(); }
                    });
                }
            });
    }
}
