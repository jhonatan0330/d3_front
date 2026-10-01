import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ImageUploaderComponent } from 'app/upload/components/image-uploader/image-uploader.component';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';
import { TenantsService } from 'app/tenants/tenants.service';
import { TenantDTO } from 'app/tenants/tenants.types';

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
    cargando = false;
    verUsuario = signal(false);
    verClave = signal(false);

    ngOnInit(): void {
        if (this.data?.key) {
            this.cargando = true;
            this.service.detalleTenant(this.data.key).subscribe({
                next: (res) => { this.tenant = res; this.cargando = false; },
                error: () => { this.cargando = false; this.dialogRef.close(); }
            });
        }
    }

    onSubmit(): void {
        if (!this.tenant.key) return;
        this.cargando = true;
        const cambios = {
            name: this.tenant.name,
            imagen: this.tenant.imagen,
            state: this.tenant.state,
            fechaValidez: this.tenant.fechaValidez ? this.tenant.fechaValidez.slice(0, 10) : undefined,
        };
        this.service.actualizarTenant(this.tenant.key, cambios).subscribe({
            next: (result) => {
                this.cargando = false;
                this.notificationCenter.fire('Éxito', 'Subtenant guardado correctamente', 'success');
                this.dialogRef.close(result);
            },
            error: () => { this.cargando = false; }
        });
    }
}
