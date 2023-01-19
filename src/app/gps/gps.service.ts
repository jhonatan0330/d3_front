import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { GPSDispositivoDTO } from './gps.domain';
import { LocalStoreService } from 'app/shared/services/local-store.service';


@Injectable({
    providedIn: 'root'
})
export class GPSService
{
    // Private
    private _device: BehaviorSubject<GPSDispositivoDTO | null> = new BehaviorSubject(null);
    private _devices: BehaviorSubject<GPSDispositivoDTO[] | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private ls: LocalStoreService)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for device
     */
    get device$(): Observable<GPSDispositivoDTO>
    {
        return this._device.asObservable();
    }

    /**
     * Getter for devices
     */
    get devices$(): Observable<GPSDispositivoDTO[]>
    {
        return this._devices.asObservable();
    }

    

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get devices
     */
    getDevices(): Observable<GPSDispositivoDTO[]>
    {
        return this._httpClient.get<GPSDispositivoDTO[]>('api/apps/devices/all').pipe(
            tap((devices) => {
                this._devices.next(devices);
            })
        );
    }

    /**
     * Search devices with given query
     *
     * @param query
     */
    searchDevices(query: string): Observable<GPSDispositivoDTO[]>
    {
        return this._httpClient.get<GPSDispositivoDTO[]>(
            this.ls.getUrlAccess('/gps/get-device/' + query )
        ).pipe(
            tap((devices) => {
                this._devices.next(devices);
            })
        );
    }

    /**
     * Get device by id
     */
    getDeviceById(id: string): Observable<GPSDispositivoDTO>
    {
        return this._devices.pipe(
            take(1),
            map((devices) => {

                // Find the device
                const device = devices.find(item => item.llaveTabla === id) || null;

                // Update the device
                this._device.next(device);

                // Return the device
                return device;
            }),
            switchMap((device) => {

                if ( !device )
                {
                    return throwError('Could not found device with id of ' + id + '!');
                }

                return of(device);
            })
        );
    }

    /**
     * Create device
     */
    createDevice(): Observable<GPSDispositivoDTO>
    {
        return this.devices$.pipe(
            take(1),
            switchMap(devices => this._httpClient.post<GPSDispositivoDTO>('api/apps/devices/device', {}).pipe(
                map((newdevice) => {

                    // Update the devices with the new device
                    this._devices.next([newdevice, ...devices]);

                    // Return the new device
                    return newdevice;
                })
            ))
        );
    }

    /**
     * Update device
     *
     * @param id
     * @param device
     */
    updateDevice(id: string, device: GPSDispositivoDTO): Observable<GPSDispositivoDTO>
    {
        return this.devices$.pipe(
            take(1),
            switchMap(devices => this._httpClient.patch<GPSDispositivoDTO>('api/apps/devices/device', {
                id,
                device
            }).pipe(
                map((updateddevice) => {

                    // Find the index of the updated device
                    const index = devices.findIndex(item => item.llaveTabla === id);

                    // Update the device
                    devices[index] = updateddevice;

                    // Update the devices
                    this._devices.next(devices);

                    // Return the updated device
                    return updateddevice;
                }),
                switchMap(updateddevice => this.device$.pipe(
                    take(1),
                    filter(item => item && item.llaveTabla === id),
                    tap(() => {

                        // Update the device if it's selected
                        this._device.next(updateddevice);

                        // Return the updated device
                        return updateddevice;
                    })
                ))
            ))
        );
    }

    /**
     * Delete the device
     *
     * @param id
     */
    deleteDevice(id: string): Observable<boolean>
    {
        return this.devices$.pipe(
            take(1),
            switchMap(devices => this._httpClient.delete('api/apps/devices/device', {params: {id}}).pipe(
                map((isDeleted: boolean) => {

                    // Find the index of the deleted device
                    const index = devices.findIndex(item => item.llaveTabla === id);

                    // Delete the device
                    devices.splice(index, 1);

                    // Update the devices
                    this._devices.next(devices);

                    // Return the deleted status
                    return isDeleted;
                })
            ))
        );
    }

}
