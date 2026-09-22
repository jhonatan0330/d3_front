import { Component, ChangeDetectionStrategy, computed, inject, signal, DestroyRef } from '@angular/core';
import {
    OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
    debounceTime,
    Observable,
    switchMap,
} from 'rxjs';

import { UtilsService } from 'app/document/service/utils.service';
import { LoginService } from 'app/authentication/login.service';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';


import { MatFormField, MatPrefix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { NgClass, AsyncPipe, I18nPluralPipe } from '@angular/common';
import { DropdownComponent } from 'app/shared/components/dropdown/dropdown/dropdown.component';
import { DropdownItemComponent } from 'app/shared/components/dropdown/dropdown-item/dropdown-item.component';
import { UsersService } from 'app/users/business/users.services';
import { AuthenticationApi } from 'app/authentication/authentication.api';
import { UsuarioDTO } from 'app/users/domain/UsuarioDTO';
import { RolAccesoFilterDTO } from 'app/authentication/domain/RolAccesoFilterDTO';


@Component({
    selector: 'UsersComponent',
    templateUrl: 'users.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatFormField, MatIcon, MatPrefix, MatInput, FormsModule, ReactiveFormsModule, NgClass, AsyncPipe, I18nPluralPipe, DropdownComponent, DropdownItemComponent]
})
export class PersonsComponent implements OnInit {
    private _jwt = inject(LoginService);
    private _contactsService = inject(UsersService);
    private _router = inject(Router);
    private utilService = inject(UtilsService);
    private notificationCenter = inject(NotificationCenterService);
    private destroyRef = inject(DestroyRef);
    private authenticationApi = inject(AuthenticationApi);

    readonly contacts = this._contactsService.contacts;

    contactsCount = computed(() => this._contactsService.contacts()?.length ?? 0);
    contactsTableColumns: string[] = ['name', 'email', 'phoneNumber', 'job'];

    searchInputControl: FormControl<string | null> = new FormControl<string | null>(null);
    selectedContact: UsuarioDTO;
    tags$: Observable<RolAccesoFilterDTO[]>;


    ngOnInit(): void {

        if (!this._jwt.validateAccessModule('persons')) {
            this._router.navigate(['/main']);
            return;
        }

        this._contactsService.clearContacts();

        this.tags$ = this._contactsService.searchTags();



        // Subscribe to search input field value changes
        this.searchInputControl.valueChanges
            .pipe(
                debounceTime(500),
                takeUntilDestroyed(this.destroyRef),
                switchMap((query) =>
                    // Search
                    this._contactsService.searchContacts(query ?? '')
                )
            )
            .subscribe({ error: () => { } });
    }


    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    limpiarNombre(nombre: string): string {
        return nombre.replace(/^rol\s+/i, '');
    }

    filtrarPorTag(tag) {
        this._contactsService.getContactByTag(tag.llaveTabla).subscribe({ error: () => { } });
    }


    onUsuarioClick(pUsuario: UsuarioDTO): void {
        this.utilService.modalUser(pUsuario.llaveTabla).subscribe({ error: () => { } });
    }


    cambiar_clave(pUsuario: UsuarioDTO) {
        //this.utilService.modalUserChangePassOther(pUsuario).subscribe();
        this.authenticationApi.recoverPassword(pUsuario.identificacion, pUsuario.correo).subscribe({
            next: () => {
                this.notificationCenter.success('Correo Enviado', 'Revisa el correo ' + pUsuario.correo + '.');
            }, error: () => { }
        });

    }
}
