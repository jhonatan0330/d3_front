import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, OnDestroy, OnInit, Output,  ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { UntypedFormControl } from '@angular/forms';
import { Observable, Subject, takeUntil } from 'rxjs';
import { GPSDispositivoDTO } from '../gps.domain';
import { GPSService } from '../gps.service';

@Component({
    selector       : 'gps-devices-list',
    templateUrl    : './list.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevicesListComponent implements OnInit, OnDestroy
{
    
    @Output() select = new EventEmitter<GPSDispositivoDTO>();
    devices$: Observable<GPSDispositivoDTO[]>;

    devicesCount: number = 0;
    devicesTableColumns: string[] = ['nombre'];

    searchInputControl: UntypedFormControl = new UntypedFormControl();
    selecteddevice: GPSDispositivoDTO;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _devicesService: GPSService,
        @Inject(DOCUMENT) private _document: any
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Get the devices
        this.devices$ = this._devicesService.devices$;
        this._devicesService.devices$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((devices: GPSDispositivoDTO[]) => {

                // Update the counts
                if(devices) this.devicesCount = devices.length;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });


        // Subscribe to MatDrawer opened change
       /* this.matDrawer.openedChange.subscribe((opened) => {
            if ( !opened )
            {
                // Remove the selected device when drawer closed
                this.selecteddevice = null;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }
        });*/

    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------


    searchDevices(){
        this._devicesService.searchDevices(this.searchInputControl.value).subscribe();
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.llaveTabla || index;
    }

    selectDevice(device: GPSDispositivoDTO) {
        this.select.emit(device);
    }
}
