import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ProjectService
{
    private _data: BehaviorSubject<any> = new BehaviorSubject(null);
    private _dataCripto: BehaviorSubject<any> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for data
     */
    get data$(): Observable<any>
    {
        return this._data.asObservable();
    }

    /**
     * Getter for data
     */
    get dataCripto$(): Observable<any>
    {
        return this._dataCripto.asObservable();
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get data
     */
    getData(): Observable<any>
    {
        return this._httpClient.get('api/dashboards/project').pipe(
            tap((response: any) => {
                this._data.next(response);
            })
        );
    }

    /**
     * Get data
     */
    getCriptoData(): Observable<any>
    {
        return this._httpClient.get('api/dashboards/crypto').pipe(
            tap((response: any) => {
                this._dataCripto.next(response);
            })
        );
    }
}
