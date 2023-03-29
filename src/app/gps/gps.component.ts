import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import {  Subject, takeUntil } from 'rxjs';
import { GPSDispositivoDTO } from './gps.domain';
import { GPSService } from './gps.service';
import { MapComponent } from './map/map.component';

@Component({
    selector: 'gps',
    templateUrl: './gps.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GPSComponent {
    @ViewChild('drawer') drawer: MatDrawer;
    @ViewChild('map') map: MapComponent;
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;

    dateFilter = new FormControl(this._gpsService.dayToList);
    sliderControl = new FormControl(0);
    hourOfDay: string;
    public device: GPSDispositivoDTO;

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    /**
     * Constructor
     */
    constructor(
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _gpsService: GPSService
    ) {
        
        this.device = this._gpsService.device;
        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {

                // Set the drawerMode if the given breakpoint is active
                if (matchingAliases.includes('lg')) {
                    this.drawerMode = 'side';
                }
                else {
                    this.drawerMode = 'over';
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        this.sliderControl.valueChanges.subscribe(value => {
            this.calculeHourOfDay(value);
        });
        this.dateFilter.valueChanges.subscribe(x => {
            this.refresh();
        });
        this.calculeHourOfDay(0);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    onSelectDevice(device: GPSDispositivoDTO) {
        this.device = device
        this._gpsService.selectDevice(device)
    }

    calculeHourOfDay(value: number) {
        const dateCalculate = new Date();
        dateCalculate.setMinutes(value % 60);
        dateCalculate.setHours(value / 60);
        dateCalculate.setSeconds(0);
        this.hourOfDay = dateCalculate.toLocaleTimeString();
    }

    refresh() {
        this._gpsService.dayToList = this.dateFilter.value;
        this._gpsService.getLocationsFromDevice().subscribe();
    }


}
