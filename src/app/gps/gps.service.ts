import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { GPSDispositivoDTO, GPSLocalizacionDTO, GPSLocalizacionFilterDTO } from './gps.domain';
import { LocalStoreService } from 'app/shared/local-store.service';


@Injectable({
    providedIn: 'root'
})
export class GPSService {
    // Private
    private _device: GPSDispositivoDTO;
    private _devices: BehaviorSubject<GPSDispositivoDTO[] | null> = new BehaviorSubject(null);
    private _locations: BehaviorSubject<GPSLocalizacionDTO[] | null> = new BehaviorSubject(null);

    constructor(
        private _httpClient: HttpClient,
        private ls: LocalStoreService) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    get device(): GPSDispositivoDTO {
        return this._device;
    }

    get devices$(): Observable<GPSDispositivoDTO[]> {
        return this._devices.asObservable();
    }

    get locations$(): Observable<GPSLocalizacionDTO[]> {
        return this._locations.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Search devices with given query
     *
     * @param query
     */
    searchDevices(query: string): Observable<GPSDispositivoDTO[]> {
        return this._httpClient.get<GPSDispositivoDTO[]>(
            this.ls.getUrlAccess('/gps/get-device/' + query)
        ).pipe(
            tap((devices) => {
                this._devices.next(devices);
            })
        );
    }

    selectDevice(_device: GPSDispositivoDTO) {
        this._device = _device;
        this.getLocationsFromDevice().subscribe();
    }

    dayToList = new Date();

    getLocationsFromDevice(): Observable<GPSLocalizacionDTO[]> {
        if (!this._device) { return; }
        const filter: GPSLocalizacionFilterDTO = new GPSLocalizacionFilterDTO();
        filter.dispositivo = this._device.llaveTabla;
        filter.fechaMin = new Date(this.dayToList);
        filter.fechaMin.setHours(0);
        filter.fechaMin.setMinutes(0);
        filter.fechaMin.setSeconds(0);
        filter.fechaMax = new Date(filter.fechaMin.getTime() + 1000 * 60 * 60 * 24);
        return this._httpClient.post<GPSLocalizacionDTO[]>(
            this.ls.getUrlAccess('/gps/getGPSLocation/'), filter
        ).pipe(
            tap((locations) => {
                this._locations.next(locations);
            })
        );
    }

}
