import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, ReplaySubject, tap } from 'rxjs';
import { ActividadDTO } from 'app/notification/notification.types';
import { UsuarioDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { LocalStoreService } from 'app/shared/local-store.service';

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
      this.ls.getUrlAccess('/notification/getNotifications', _server)
    ).pipe(
      tap((notifications) => {
        this._notifications.next(notifications);
      })
    );
  }

  clear(){
    this._notifications.next([]);
  }

  readActivity(actividad: ActividadDTO, _server: string = null): Observable<ActividadDTO> {
    return this.http.post<ActividadDTO>(
      this.ls.getUrlAccess('/notification/readActivity', _server),
      actividad
    );
  }

  transfer(plantilla: ActividadDTO, _server: string): Observable<ActividadDTO> {
    return this.http.post<ActividadDTO>(
      this.ls.getUrlAccess('/notification/transfer', _server),
      plantilla
    );
  }

  usersToTransfer(plantilla: ActividadDTO, _server: string): Observable<UsuarioDTO[]> {
    return this.http.post<UsuarioDTO[]>(
      this.ls.getUrlAccess('/notification/userToTransfer', _server),
      plantilla
    );
  }


}
