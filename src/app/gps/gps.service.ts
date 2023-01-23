import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GPSLocalizacionFilterDTO } from 'app/modules/full/neuron/model/sw42.filter';
import { LocalStoreService } from 'app/shared/services/local-store.service';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { GPSDispositivoDTO, GPSLocalizacionDTO } from './gps.domain';


@Injectable({
    providedIn: 'root'
})
export class GPSService {
    // Private
    private _devices: BehaviorSubject<GPSDispositivoDTO[] | null> = new BehaviorSubject(null);
    private _locations: BehaviorSubject<GPSLocalizacionDTO[] | null> = new BehaviorSubject(null);

    constructor(
        private _httpClient: HttpClient,
        private ls: LocalStoreService) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

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

    getLocationsFromDevice(filter: GPSLocalizacionFilterDTO): Observable<GPSLocalizacionDTO[]> {
        return this._httpClient.post<GPSLocalizacionDTO[]>(
            this.ls.getUrlAccess('/gps/getGPSLocation/'), filter
        ).pipe(
            tap((locations) => {
                this._locations.next(locations);
            })
        );
    }

}
