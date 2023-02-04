import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, ReplaySubject, tap } from 'rxjs';
import { ActividadDTO } from 'app/notification/notification.types';
import { LocalStoreService } from 'app/shared/services/local-store.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private _notifications: ReplaySubject<ActividadDTO[]> = new ReplaySubject<ActividadDTO[]>(1);

  constructor(
    private http: HttpClient,
    private ls: LocalStoreService
  ) {
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  /**
   * Getter for notifications
   */
  get notifications$(): Observable<ActividadDTO[]> {
    return this._notifications.asObservable();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Get all notifications
   */
  getAll(_server: string = null): Observable<ActividadDTO[]> {
    return this.http.get<ActividadDTO[]>(
      this.ls.getUrlAccess('/document/getUserActivities', _server)
    ).pipe(
      tap((notifications) => {
        this._notifications.next(notifications);
      })
    );
  }

  listUserActivities(_server: string): Observable<ActividadDTO[]> {
    return this.http.get<ActividadDTO[]>(
      this.ls.getUrlAccess('/document/getUserActivities', _server)
    );
  }

  readActivity(actividad: ActividadDTO, _server: string = null): Observable<ActividadDTO> {
    return this.http.post<ActividadDTO>(
      this.ls.getUrlAccess('/document/readActivity', _server),
      actividad
    );
  }

  reasignar(plantilla: ActividadDTO, _server: string): Observable<ActividadDTO> {
    return this.http.post<ActividadDTO>(
      this.ls.getUrlAccess('/rest/reasignar', _server),
      plantilla
    );
  }




}
