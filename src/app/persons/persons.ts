import {
    Component,
} from '@angular/core';
import {
    ChangeDetectorRef,
    OnDestroy,
    OnInit,
} from '@angular/core';
import {
    UntypedFormControl,
} from '@angular/forms';
import {
    ActivatedRoute,
    Router,
} from '@angular/router';
import { ContactsService } from './contact.services';
import {
    Observable,
    Subject,
    switchMap,
    takeUntil,
} from 'rxjs';

import { UtilsService } from 'app/modules/full/neuron/service/utils.service';
import { RolAccesoFilterDTO, UsuarioDTO } from 'app/authentication/authentication.domain';


@Component({
    selector: 'PersonsComponent',
    templateUrl: 'persons.html'
})
export class PersonsComponent implements OnInit, OnDestroy {


    contacts$: Observable<UsuarioDTO[]>;

    contactsCount: number = 0;
    contactsTableColumns: string[] = ['name', 'email', 'phoneNumber', 'job'];
    drawerMode: 'side' | 'over';
    searchInputControl: UntypedFormControl = new UntypedFormControl();
    selectedContact: UsuarioDTO;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    tags$: Observable<RolAccesoFilterDTO[]>;


    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _contactsService: ContactsService,
        private _router: Router,
        private utilService: UtilsService
    ) { }


    ngOnInit(): void {
        // Get the contacts
        this._contactsService.contacts$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((contacts: UsuarioDTO[]) => {
                // Update the counts
                if (contacts) this.contactsCount = contacts.length;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this.contacts$ = this._contactsService.contacts$;


        this.tags$ = this._contactsService.searchTags();



        // Subscribe to search input field value changes
        this.searchInputControl.valueChanges
            .pipe(
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

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------


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


    cambiar_clave(pUsuario) {
        this.utilService.modalUserChangePassOther(pUsuario).subscribe();
    }
}
