import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { MatButton } from '@angular/material/button';
import { Subject, takeUntil } from 'rxjs';
import { ActividadDTO } from 'app/notification/notification.types';
import { NotificationsService } from 'app/notification/notification.service';
import { TemplateService } from 'app/modules/full/neuron/service/template.service';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import { PedidoVentaDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { UtilsService } from 'app/modules/full/neuron/service/utils.service';
import { LoginService } from 'app/authentication/login.service';


@Component({
    selector: 'notifications',
    templateUrl: './notification-button.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'notifications'
})
export class NotificationButtonComponent implements OnInit, OnDestroy {
    @ViewChild('notificationsOrigin') private _notificationsOrigin: MatButton;
    @ViewChild('notificationsPanel') private _notificationsPanel: TemplateRef<any>;

    notifications: ActividadDTO[];
    notificationCount: number = 0;
    pastTimeCount: number = 0;
    private _overlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _notificationsService: NotificationsService,
        private _overlay: Overlay,
        private _viewContainerRef: ViewContainerRef,
        private templateService: TemplateService,
        private _jwtAuth: LoginService,
        private utilsService: UtilsService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Subscribe to notification changes
        this._notificationsService.notifications$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((notifications: ActividadDTO[]) => {

                // Load the notifications
                this.notifications = notifications;

                // Calculate the unread count
                this._calculateUnreadCount();

                // Mark for check
                this._changeDetectorRef.markForCheck();

                this.showMessage();
            });
        this.templateService.templates$
            .pipe((takeUntil(this._unsubscribeAll)))
            .subscribe((templates) => {
                if (templates && templates.length !== 0) { this.refresh(); }
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

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Open the notifications panel
     */
    openPanel(): void {
        // Return if the notifications panel or its origin is not defined
        if (!this._notificationsPanel || !this._notificationsOrigin) {
            return;
        }

        // Create the overlay if it doesn't exist
        if (!this._overlayRef) {
            this._createOverlay();
        }

        // Attach the portal to the overlay
        this._overlayRef.attach(new TemplatePortal(this._notificationsPanel, this._viewContainerRef));

        this.refresh();
    }

    /**
     * Close the notifications panel
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
                .flexibleConnectedTo(this._notificationsOrigin._elementRef.nativeElement)
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

    /**
     * Calculate the unread count
     *
     * @private
     */
    private _calculateUnreadCount(): void {
        this.notificationCount = this.notifications.length;
        if ( this.notifications && this.notifications.length )
        {
            this.pastTimeCount = this.notifications.filter(notification => (notification.fechaTerminar && notification.fechaTerminar < new Date())).length;
        }
    }

    getColor(pEstado: string) {
        return this.templateService.getColor(pEstado);
    }

    getColorFont(pEstado: string) {
        return this.templateService.getColorFont(pEstado);
    }

    openDialog(plantilla: string, id: string, server: string) {
        const pedidoVenta: PedidoVentaDTO = new PedidoVentaDTO();
        pedidoVenta.plantilla = plantilla;
        pedidoVenta.llaveTabla = id;
        pedidoVenta.server = server;
        this.utilsService.modalWithParams(pedidoVenta).subscribe(() => {
            this.refresh();
        });
    }

    openDocument(document: ActividadDTO) {
        this.openDialog(document.documentoDTO.plantilla, document.documentoDTO.llaveTabla
            , document.documentoDTO.server);
    }

    readActivity(actividad: ActividadDTO) {
        if (!actividad.fechaLeido) {
            this._notificationsService.readActivity(actividad).subscribe({
                next: () => {
                    this.openDocument(actividad);
                }
            });
        } else {
            this.openDocument(actividad);
        }

    }

    refresh() {
        this._notificationsService.getAll().subscribe();
    }

    showMessage() {
        if (this.notifications && this.notifications.length !== 0) {
            const sinleer = this.notifications.filter(x => !x.fechaLeido);
            if (sinleer && sinleer.length !== 0) {
                if (!PlantillaHelper.buscarPropiedad(this._jwtAuth.company.propiedades, PlantillaHelper.FORCE_NOTIFICATION)) {
                    this.readActivity(sinleer[0]);
                }
            }
        }
    }

}
