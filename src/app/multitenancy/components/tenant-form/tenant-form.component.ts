import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ImageUploaderComponent } from 'app/upload/components/image-uploader/image-uploader.component';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';
import { TenantsService } from 'app/multitenancy/business/tenants.service';
import { TenantCrearDTO, TenantDTO } from 'app/multitenancy/domain/tenants.types';

@Component({
    selector: 'tenant-form',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, ImageUploaderComponent],
    templateUrl: './tenant-form.component.html',
})
export class TenantFormComponent implements OnInit {
    private notificationCenter = inject(NotificationCenterService);
    public dialogRef = inject<MatDialogRef<TenantFormComponent>>(MatDialogRef);
    public data = inject<TenantDTO | null>(MAT_DIALOG_DATA);
    private service = inject(TenantsService);

    tenant: TenantDTO = new TenantDTO();
    admin = { nombre: '', identificacion: '', correo: '', telefono: '' };
    cargando = signal(false);
    verUsuario = signal(false);
    verClave = signal(false);

    get esNuevo(): boolean {
        return !this.data?.key;
    }

    ngOnInit(): void {
        if (this.data?.key) {
            this.cargando.set(true);
            this.service.detalleTenant(this.data.key).pipe(finalize(() => this.cargando.set(false))).subscribe({
                next: (res) => { this.tenant = res; },
                error: () => { this.dialogRef.close(); }
            });
        }
    }

    onSubmit(): void {
        if (this.esNuevo) {
            this.crear();
            return;
        }
        if (!this.tenant.key) return;
        this.cargando.set(true);
        const cambios = {
            name: this.tenant.name,
            imagen: this.tenant.imagen,
            state: this.tenant.state,
            fechaValidez: this.tenant.fechaValidez ? this.tenant.fechaValidez.slice(0, 10) : undefined,
        };
        this.service.actualizarTenant(this.tenant.key, cambios).pipe(finalize(() => this.cargando.set(false))).subscribe({
            next: (result) => {
                this.notificationCenter.fire('Éxito', 'Subtenant guardado correctamente', 'success');
                this.dialogRef.close(result);
            },
            error: () => { }
        });
    }

    crear(): void {
        this.cargando.set(true);
        const dto: TenantCrearDTO = {
            nombre: (this.tenant.name ?? '').trim(),
            codigo: (this.tenant.codigo ?? '').trim(),
            imagen: this.tenant.imagen,
            adminNombre: this.admin.nombre.trim(),
            adminIdentificacion: this.admin.identificacion.trim(),
            adminCorreo: this.admin.correo.trim(),
            adminTelefono: this.admin.telefono.trim() || undefined,
        };
        this.service.crearTenant(dto).pipe(finalize(() => this.cargando.set(false))).subscribe({
            next: (result) => {
                this.notificationCenter.fire('Éxito', 'Tenant creado correctamente', 'success');
                this.dialogRef.close(result);
            },
            error: () => { }
        });
    }
}
