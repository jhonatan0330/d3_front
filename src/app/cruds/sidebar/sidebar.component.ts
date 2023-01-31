import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { CrudsService } from '../cruds.service';
import { DocumentoPlantillaDTO } from 'app/modules/full/neuron/model/sw42.domain';

@Component({
    selector: 'cruds-sidebar',
    templateUrl: './sidebar.component.html',
    encapsulation: ViewEncapsulation.None
})
export class CrudsSidebarComponent implements OnInit, OnDestroy {

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    form: FormGroup = new FormGroup({});
    fControlCheck: FormControl = new FormControl(false); // Check que indica si se debe realizar una busqueda por codigo exacto
    fControlSearch: FormControl = new FormControl(); // Texto que digita el usuario para filtrar
    fControlDateStart: FormControl = new FormControl();
    fControlDateEnd: FormControl = new FormControl();

    isLoading = false;


    public plantilla: DocumentoPlantillaDTO;
    public isFiltering = false;

    /**
     * Constructor
     */
    constructor(
        private _crudsService: CrudsService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {

        this._crudsService.plantilla$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((plantilla: DocumentoPlantillaDTO) => {
                this.plantilla = plantilla;
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    listar(_pagina: number) {

    }
}
