import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import {
    ChangeDetectorRef,
    OnDestroy,
    OnInit,
} from '@angular/core';
import { UntypedFormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { ContactsService } from './contact.services';
import {
    debounceTime,
    Observable,
    Subject,
    switchMap,
    takeUntil,
} from 'rxjs';

import { UtilsService } from 'app/modules/full/neuron/service/utils.service';
import { RolAccesoFilterDTO, UsuarioDTO } from 'app/authentication/authentication.domain';
import { LoginService } from 'app/authentication/login.service';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import { NotificationCenterService } from 'app/notification/notification-center.service';
import { MatDrawerContainer, MatDrawer, MatDrawerContent } from '@angular/material/sidenav';
import { MatFormField, MatPrefix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { NgClass, AsyncPipe, I18nPluralPipe } from '@angular/common';
import { MatIconButton } from '@angular/material/button';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';


@Component({
    selector: 'PersonsComponent',
    templateUrl: 'persons.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatDrawerContainer, MatDrawer, RouterOutlet, MatDrawerContent, MatFormField, MatIcon, MatPrefix, MatInput, FormsModule, ReactiveFormsModule, NgClass, MatIconButton, MatMenuTrigger, MatMenu, MatMenuItem, AsyncPipe, I18nPluralPipe]
})
export class PersonsComponent implements OnInit, OnDestroy {
    private _activatedRoute = inject(ActivatedRoute);
    private _changeDetectorRef = inject(ChangeDetectorRef);
    private _jwt = inject(LoginService);
    private _contactsService = inject(ContactsService);
    private _router = inject(Router);
    private utilService = inject(UtilsService);



    contacts$: Observable<UsuarioDTO[]>;

    contactsCount: number = 0;
    contactsTableColumns: string[] = ['name', 'email', 'phoneNumber', 'job'];
    drawerMode: 'side' | 'over';
    searchInputControl: UntypedFormControl = new UntypedFormControl();
    selectedContact: UsuarioDTO;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    tags$: Observable<RolAccesoFilterDTO[]>;


    ngOnInit(): void {

        if (!this._jwt.validateAccessModule('persons') ) {
            this._router.navigate(['/main']);
            return;
        }
        // Get the contacts
        this._contactsService.contacts$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((contacts: UsuarioDTO[]) => {
                // Update the counts
                if (contacts) this.contactsCount = contacts.length;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

            this._contactsService.clearContacts();
        this.contacts$ = this._contactsService.contacts$;


        this.tags$ = this._contactsService.searchTags();



        // Subscribe to search input field value changes
        this.searchInputControl.valueChanges
            .pipe(
                debounceTime(500),
                takeUntil(this._unsubscribeAll),
                switchMap((query) =>
                    // Search
                    this._contactsService.searchContacts(query)
                )
            )
            .subscribe();
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }


    onBackdropClicked(): void {
        this._router.navigate(['./'], { relativeTo: this._activatedRoute });
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    limpiarNombre(nombre: string): string {
        return nombre.replace(/^rol\s+/i, '');
    }

    filtrarPorTag(tag) {
        this._contactsService.getContactByTag(tag.llaveTabla).subscribe();
    }


    onUsuarioClick(pUsuario: UsuarioDTO): void {
        this.utilService.modalUser(pUsuario.llaveTabla).subscribe();
    }


    cambiar_clave(pUsuario: UsuarioDTO) {
        //this.utilService.modalUserChangePassOther(pUsuario).subscribe();
        this._jwt.recoverPassword(pUsuario.identificacion, pUsuario.correo).subscribe(() => {
            const notificationCenter = new NotificationCenterService();
            notificationCenter.success('Correo Enviado', 'Revisa el correo ' + pUsuario.correo + '.');
        });

    }
}
