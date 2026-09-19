import { Component, ElementRef, EventEmitter, HostBinding, Input, OnChanges, OnDestroy, OnInit, Output, Renderer2, SimpleChanges, ViewChild, ViewEncapsulation , inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { ApiService } from 'app/document/document.api';
import { PedidoVentaDTO, PedidoVentaFilterDTO } from 'app/document/document.types';
import { TemplateService } from 'app/document/service/template.service';
import { UtilsService } from 'app/document/service/utils.service';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';
import { Subject } from 'rxjs';

@Component({
    selector: 'search',
    templateUrl: './search.component.html',
    encapsulation: ViewEncapsulation.None,
    exportAs: 'fuseSearch',
    imports: [MatAutocompleteModule, MatIcon, ReactiveFormsModule, FormsModule, MatOptionModule]
})
export class SearchComponent implements OnChanges, OnInit, OnDestroy {
    @Input() appearance: 'basic' | 'bar' = 'basic';
    @Input() debounce: number = 300;
    @Input() minLength: number = 2;
    @Output() search: EventEmitter<any> = new EventEmitter<any>();

    opened: boolean = false;
    isLoading: boolean = false;
    resultSets: PedidoVentaDTO[];
    searchControl: UntypedFormControl = new UntypedFormControl();
    private _matAutocomplete: MatAutocomplete;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    private notificationCenter = inject(NotificationCenterService);

    /**
     * Constructor
     */
    constructor(
        private api: ApiService,
        private templateService: TemplateService,
        private utilsService: UtilsService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Host binding for component classes
     */
    @HostBinding('class') get classList(): any {
        return {
            'search-appearance-bar': this.appearance === 'bar',
            'search-appearance-basic': this.appearance === 'basic',
            'search-opened': this.opened
        };
    }

    /**
     * Setter for bar search input
     *
     * @param value
     */
    @ViewChild('barSearchInput')
    set barSearchInput(value: ElementRef) {
        // If the value exists, it means that the search input
        // is now in the DOM, and we can focus on the input..
        if (value) {
            // Give Angular time to complete the change detection cycle
            setTimeout(() => {

                // Focus to the input element
                value.nativeElement.focus();
            });
        }
    }

    /**
     * Setter for mat-autocomplete element reference
     *
     * @param value
     */
    @ViewChild('matAutocomplete')
    set matAutocomplete(value: MatAutocomplete) {
        this._matAutocomplete = value;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On changes
     *
     * @param changes
     */
    ngOnChanges(changes: SimpleChanges): void {
        // Appearance
        if ('appearance' in changes) {
            // To prevent any issues, close the
            // search after changing the appearance
            this.close();
        }
    }

    /**
     * On init
     */
    ngOnInit(): void {
        this.searchControl.valueChanges.subscribe((value) => {
            // Algunas ocaciones recibo string aqui valido que se coloque un objeto como proceso
            if (value && value.llaveTabla) {
                this.openDocument(value);
                this.resultSets = [];
                this.searchControl.setValue('');
            }
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
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * On keydown of the search input
     *
     * @param event
     */
    onKeydown(event: KeyboardEvent): void {
        // Escape
        if (event.code === 'Escape') {
            // If the appearance is 'bar' and the mat-autocomplete is not open, close the search
            if (this.appearance === 'bar' && !this._matAutocomplete.isOpen) {
                this.close();
            }
        }
    }

    /**
     * Open the search
     * Used in 'bar'
     */
    open(): void {
        // Return if it's already opened
        if (this.opened) {
            return;
        }

        // Open the search
        this.opened = true;
    }

    /**
     * Close the search
     * * Used in 'bar'
     */
    close(): void {
        // Return if it's already closed
        if (!this.opened) {
            return;
        }

        // Clear the search input
        this.searchControl.setValue('');

        // Close the search
        this.opened = false;
    }

    searchDocument() {
        const texto = this.searchControl.value;
        if (texto && texto.llaveTabla) {
          this.searchControl.setValue('');
          return;
        }
        if (!texto || texto.length === 0) {
            // pasar esto a util para usar menos codigo
            this.notificationCenter.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Coloque el codigo exacto del documento',
            });
            // alert('Coloque el codigo exacto del documento');
            return;
        }
        const entitySearch: PedidoVentaFilterDTO = new PedidoVentaFilterDTO();
        entitySearch.nombre = texto;
        this.isLoading = true;
        this.api.listarDocumentos(entitySearch).subscribe({
          next: (_value: PedidoVentaDTO[]) => {
            this.isLoading = false;
            this.resultSets = [];
            if (!_value || _value.length === 0) {
              alert('No se encontraron resultados para ' + this.searchControl.value);
              //this.searchCtrl.setValue('');
              return;
            }
            if (_value.length === 1) {
              this.openDocument(_value[0]);
              this.close();
            } else {
              this.resultSets = _value.filter((item: PedidoVentaDTO) => item.estado !== 'I');
            }
          },
          error: (err: any) => {
            this.isLoading = false;
          },
        });
    }

    openDocument(_doc: PedidoVentaDTO) {
        if (this.templateService.getTemplate(_doc.plantilla)) {
            this.utilsService.modalWithParams(
                _doc,
                false
            );
        } else {
            alert('No tienes permisos para ver este documento.');
        }
    }

    autoCompleteDisplay(item: PedidoVentaDTO): string {
        if (!item) {
          return '';
        }
        if (item.descripcion) {
          return item.descripcion;
        } else {
          return item.nombre;
        }
      }
}
