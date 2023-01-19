import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormControl } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { filter, fromEvent, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
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
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _devicesService: GPSService,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _fuseMediaWatcherService: FuseMediaWatcherService
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

        // Get the device
        this._devicesService.device$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((device: GPSDispositivoDTO) => {

                // Update the selected device
                this.selecteddevice = device;

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

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) => {

                // Set the drawerMode if the given breakpoint is active
               /* if ( matchingAliases.includes('lg') )
                {
                    this.drawerMode = 'side';
                }
                else
                {
                    this.drawerMode = 'over';
                }*/

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Listen for shortcuts
        fromEvent(this._document, 'keydown')
            .pipe(
                takeUntil(this._unsubscribeAll),
                filter<KeyboardEvent>(event =>
                    (event.ctrlKey === true || event.metaKey) // Ctrl or Cmd
                    && (event.key === '/') // '/'
                )
            )
            .subscribe(() => {
                this.createDevice();
            });
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

    /**
     * On backdrop clicked
     */
    onBackdropClicked(): void
    {
        // Go back to the list
        this._router.navigate(['./'], {relativeTo: this._activatedRoute});

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Create device
     */
    createDevice(): void
    {
        // Create the device
        this._devicesService.createDevice().subscribe((newdevice) => {

            // Go to the new device
            this._router.navigate(['./', newdevice.llaveTabla], {relativeTo: this._activatedRoute});

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

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
}
