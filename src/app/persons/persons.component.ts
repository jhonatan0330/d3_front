import { Component, ChangeDetectionStrategy, computed, inject, signal, DestroyRef } from '@angular/core';
import {
    OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UntypedFormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { ContactsService } from './contact.services';
import {
    debounceTime,
    Observable,
    switchMap,
} from 'rxjs';

import { UtilsService } from 'app/modules/full/neuron/service/utils.service';
import { RolAccesoFilterDTO, UsuarioDTO } from 'app/authentication/authentication.domain';
import { LoginService } from 'app/authentication/login.service';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import { NotificationCenterService } from 'app/notification/notification-center.service';


import { MatFormField, MatPrefix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { NgClass, AsyncPipe, I18nPluralPipe } from '@angular/common';
import { DropdownComponent } from 'app/shared/components/dropdown/dropdown.component';
import { DropdownItemComponent } from 'app/shared/components/dropdown/dropdown-item.component';


@Component({
    selector: 'PersonsComponent',
    templateUrl: 'persons.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterOutlet,MatFormField,MatIcon,MatPrefix,MatInput,FormsModule,ReactiveFormsModule,NgClass,AsyncPipe,I18nPluralPipe,DropdownComponent,DropdownItemComponent]
})
export class PersonsComponent implements OnInit {
    private _activatedRoute = inject(ActivatedRoute);
    private _jwt = inject(LoginService);
    private _contactsService = inject(ContactsService);
    private _router = inject(Router);
    private utilService = inject(UtilsService);
    private destroyRef = inject(DestroyRef);



    readonly contacts = this._contactsService.contacts;

    contactsCount = computed(() => this._contactsService.contacts()?.length ?? 0);
    contactsTableColumns: string[] = ['name', 'email', 'phoneNumber', 'job'];
    drawerOpened = signal(false);
    drawerMode: 'side' | 'over';
    searchInputControl: UntypedFormControl = new UntypedFormControl();
    selectedContact: UsuarioDTO;
    tags$: Observable<RolAccesoFilterDTO[]>;


    ngOnInit(): void {

        if (!this._jwt.validateAccessModule('persons') ) {
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
                    this._contactsService.searchContacts(query)
                )
            )
            .subscribe({ error: () => {} });
    }


    onBackdropClicked(): void {
        this._router.navigate(['./'], { relativeTo: this._activatedRoute });
    }

    openDrawer(): void {
        this.drawerOpened.set(true);
    }

    closeDrawer(): void {
        this.drawerOpened.set(false);
    }

    toggleDrawer(): void {
        this.drawerOpened.update((v) => !v);
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    limpiarNombre(nombre: string): string {
        return nombre.replace(/^rol\s+/i, '');
    }

    filtrarPorTag(tag) {
        this._contactsService.getContactByTag(tag.llaveTabla).subscribe({ error: () => {} });
    }


    onUsuarioClick(pUsuario: UsuarioDTO): void {
        this.utilService.modalUser(pUsuario.llaveTabla).subscribe({ error: () => {} });
    }


    cambiar_clave(pUsuario: UsuarioDTO) {
        //this.utilService.modalUserChangePassOther(pUsuario).subscribe();
        this._jwt.recoverPassword(pUsuario.identificacion, pUsuario.correo).subscribe({ next: () => {
            const notificationCenter = new NotificationCenterService();
            notificationCenter.success('Correo Enviado', 'Revisa el correo ' + pUsuario.correo + '.');
        }, error: () => {} });

    }
}
