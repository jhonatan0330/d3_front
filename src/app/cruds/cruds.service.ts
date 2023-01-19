import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CrudsService
{
    selectedMailChanged: BehaviorSubject<any> = new BehaviorSubject(null);
    private _mailsLoading: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private _pagination: BehaviorSubject<any> = new BehaviorSubject(null);

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
     * Getter for pagination
     */
    get pagination$(): Observable<any>
    {
        return this._pagination.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    
}
