import { Component, ChangeDetectionStrategy, inject, signal, computed, DestroyRef } from '@angular/core';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { UtilsService } from 'app/document/service/utils.service';
import { PedidoVentaDTO } from 'app/document/document.types';
import { MatIcon } from '@angular/material/icon';
import { UsersService } from 'app/users/business/users.services';
import { ChangePictureComponent } from 'app/layout/change-picture/change-picture.component';
import { UsuarioDTO } from 'app/users/domain/UsuarioDTO';
import { RolAccesoFilterDTO } from 'app/authentication/domain/RolAccesoFilterDTO';
import { LayoutService } from 'app/layout/layout.service';

@Component({
    selector: 'contacts-details',
    templateUrl: 'detail-person.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatIcon, ChangePictureComponent]
})
export class ContactsDetailsComponent {
    private _contactsService = inject(UsersService);
    data = inject<{ key: string }>(MAT_DIALOG_DATA);
    private dialogRef = inject<MatDialogRef<ContactsDetailsComponent>>(MatDialogRef);
    private readonly layoutService = inject(LayoutService);
    private utilService = inject(UtilsService);
    private destroyRef = inject(DestroyRef);

    contact = toSignal(
        this._contactsService.getContactById(this.data.key),
        { initialValue: new UsuarioDTO() }
    );

    isSameUser = computed(() => {
        const c = this.contact();
        return this.layoutService.user().llaveTabla === c.llaveTabla;
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
                error: () => { }
            });
    }

}


