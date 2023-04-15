import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { MatButton } from '@angular/material/button';
import { Subject, takeUntil } from 'rxjs';
import { DocumentoPlantillaDTO, PedidoVentaDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { UtilsService } from 'app/modules/full/neuron/service/utils.service';
import { TemplateService } from 'app/modules/full/neuron/service/template.service';
import { PlantillaHelper } from 'app/shared/plantilla-helper';

@Component({
    selector: 'shortcuts',
    templateUrl: './shortcuts.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'shortcuts'
})
export class ShortcutsComponent implements OnInit, OnDestroy {
    @ViewChild('shortcutsOrigin') private _shortcutsOrigin: MatButton;
    @ViewChild('shortcutsPanel') private _shortcutsPanel: TemplateRef<any>;

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

    shortcuts: DocumentoPlantillaDTO[];
    shortcutsFiltered: DocumentoPlantillaDTO[];
    private _overlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();


    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _templateService: TemplateService,
        private _overlay: Overlay,
        private _viewContainerRef: ViewContainerRef,
        private _utilService: UtilsService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Get the shortcuts
        this._templateService.templates$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((templates: DocumentoPlantillaDTO[]) => {
                this.shortcuts = [];
                if (templates && templates.length) {
                    for (let i = 0; i < templates.length; i++) {
                        const iTemplate = templates[i];
                        if (PlantillaHelper.buscarPropiedad(iTemplate.propiedades, PlantillaHelper.PERMISO_PLANTILLA_LISTAR_MENU)
                            && PlantillaHelper.buscarPropiedad(iTemplate.propiedades, PlantillaHelper.PERMISO_PLANTILLA_CREAR)) {
                            this.shortcuts.push(iTemplate);
                        }
                    }
                }
                this.shortcutsFiltered = Object.assign([], this.shortcuts);
                this._changeDetectorRef.markForCheck();
            });


    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();

        // Dispose the overlay
        if (this._overlayRef) {
            this._overlayRef.dispose();
        }
    }

    showTemplate(shortcut: DocumentoPlantillaDTO) {
        const pedidoVenta: PedidoVentaDTO = new PedidoVentaDTO();
        pedidoVenta.plantilla = shortcut.llaveTabla;
        //if(shortcut.server) { 
        //pedidoVenta.serverUrl = this.templateService.getUrl4Id(this.serverId) 
        //}
        this._utilService.modalWithParams(pedidoVenta, true);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Open the shortcuts panel
     */
    openPanel(): void {
        // Return if the shortcuts panel or its origin is not defined
        if (!this._shortcutsPanel || !this._shortcutsOrigin) {
            return;
        }

        // Create the overlay if it doesn't exist
        if (!this._overlayRef) {
            this._createOverlay();
        }

        // Attach the portal to the overlay
        this._overlayRef.attach(new TemplatePortal(this._shortcutsPanel, this._viewContainerRef));

    }

    /**
     * Close the shortcuts panel
     */
    closePanel(): void {
        this._overlayRef.detach();
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    filterItem(value) {
        if (!value) {
            this.shortcutsFiltered = Object.assign([], this.shortcuts);
        } // when nothing has typed
        this.shortcutsFiltered = Object.assign([], this.shortcuts).filter(
            (item) => item.nombre.toLowerCase().indexOf(value.toLowerCase()) > -1
        );
    }

    onKeydown(event: KeyboardEvent): void {
        // Escape
        if (event.code === 'Enter') {
            if (this.shortcutsFiltered && this.shortcutsFiltered.length != 0) {
                this.showTemplate(this.shortcutsFiltered[0]);
            }
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Create the overlay
     */
    private _createOverlay(): void {
        // Create the overlay
        this._overlayRef = this._overlay.create({
            hasBackdrop: true,
            backdropClass: 'fuse-backdrop-on-mobile',
            scrollStrategy: this._overlay.scrollStrategies.block(),
            positionStrategy: this._overlay.position()
                .flexibleConnectedTo(this._shortcutsOrigin._elementRef.nativeElement)
                .withLockedPosition(true)
                .withPush(true)
                .withPositions([
                    {
                        originX: 'start',
                        originY: 'bottom',
                        overlayX: 'start',
                        overlayY: 'top'
                    },
                    {
                        originX: 'start',
                        originY: 'top',
                        overlayX: 'start',
                        overlayY: 'bottom'
                    },
                    {
                        originX: 'end',
                        originY: 'bottom',
                        overlayX: 'end',
                        overlayY: 'top'
                    },
                    {
                        originX: 'end',
                        originY: 'top',
                        overlayX: 'end',
                        overlayY: 'bottom'
                    }
                ])
        });

        // Detach the overlay from the portal on backdrop click
        this._overlayRef.backdropClick().subscribe(() => {
            this._overlayRef.detach();
        });
    }
}
