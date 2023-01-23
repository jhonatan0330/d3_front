import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, ViewChild, ViewEncapsulation } from '@angular/core';
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
                if(locations){
                    for (let i = 0; i < locations.length; i++) {
                       const element = locations[i];
                       this.map.addPoint(element.latitud,element.longitud); 
                       this.map.center(element.latitud,element.longitud);
                    }
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
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    onSelectDevice(device: GPSDispositivoDTO) {
        const filter: GPSLocalizacionFilterDTO = new GPSLocalizacionFilterDTO();
        filter.dispositivo = device.llaveTabla;
        this._gpsService.getLocationsFromDevice(filter).subscribe();
    }

}
