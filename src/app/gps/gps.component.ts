import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { GPSLocalizacionFilterDTO } from 'app/modules/full/neuron/model/sw42.filter';
import { Observable, Subject, takeUntil } from 'rxjs';
import { GPSDispositivoDTO, GPSLocalizacionDTO } from './gps.domain';
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

    locations$: Observable<GPSLocalizacionDTO[]>;
    dateFilter = new FormControl(this._gpsService.dayToList);
    sliderControl = new FormControl();
    hourOfDay: string;

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    /**
     * Constructor
     */
    constructor(
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _gpsService: GPSService
    ) {
        // Get the devices
        this.locations$ = this._gpsService.locations$;
        this._gpsService.locations$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((locations: GPSLocalizacionDTO[]) => {
                if (locations) {
                    this.map.addPoint(locations);
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

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
