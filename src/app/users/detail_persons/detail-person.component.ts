import { Component, ChangeDetectionStrategy, inject, signal, computed, DestroyRef } from '@angular/core';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ContactsService } from '../users.services';
import { PermisosDTO, RolAccesoFilterDTO, UsuarioDTO } from 'app/authentication/authentication.domain';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { LoginService } from 'app/authentication/login.service';
import { UtilsService } from 'app/document/service/utils.service';
import { PedidoVentaDTO } from 'app/document/model/sw42.domain';
import { MatIcon } from '@angular/material/icon';
import { ChangePictureComponent } from '../../layout/change-picture/change-picture.component';

@Component({
    selector: 'contacts-details',
    templateUrl: 'detail-person.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [  MatIcon,ChangePictureComponent]
})
export class ContactsDetailsComponent {
    private _contactsService = inject(ContactsService);
    data = inject<{ key: string }>(MAT_DIALOG_DATA);
    private dialogRef = inject<MatDialogRef<ContactsDetailsComponent>>(MatDialogRef);
    jwtAuth = inject(LoginService);
    private utilService = inject(UtilsService);
    private destroyRef = inject(DestroyRef);

    contact = toSignal(
        this._contactsService.getContactById(this.data.key),
        { initialValue: new UsuarioDTO() }
    );

    isSameUser = computed(() => {
        const c = this.contact();
        return this.jwtAuth.getUser().llaveTabla === c.llaveTabla;
    });

    tags = signal<RolAccesoFilterDTO[]>([]);

    cerrar() {
        this.dialogRef.close();
    }

    abrirRol(tag: RolAccesoFilterDTO) {
        const componente = new PedidoVentaDTO;
        componente.llaveTabla = tag.codigo;
        componente.plantilla = tag.plantilla;
        this.utilService.modalWithParams(componente);
    }

    buscartags() {
        this._contactsService.searchTagsById(this.data.key)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (value) => this.tags.set(value),
                error: () => {}
            });
    }

}


