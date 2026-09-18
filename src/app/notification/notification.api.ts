import { Injectable, inject, signal, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ActividadDTO } from 'app/notification/domain/notification.types';
import { LocalStoreService } from 'app/shared/local-store.service';
import { UsuarioDTO } from 'app/authentication/authentication.domain';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private http = inject(HttpClient);
  private ls = inject(LocalStoreService);

  private _notifications: WritableSignal<ActividadDTO[]> = signal([]);

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  /**
   * Getter for notifications
   */
  get notifications(): ActividadDTO[] {
    return this._notifications();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Get all notifications
   */
  getAll(): Observable<ActividadDTO[]> {
    return this.http.get<ActividadDTO[]>(
      this.ls.getUrlAccess('/notification/getNotifications')
    ).pipe(
      tap((notifications) => {
        this._notifications.set(notifications);
      })
    );
  }

  clear(){
    this._notifications.set([]);
  }

  readActivity(actividad: ActividadDTO): Observable<ActividadDTO> {
    return this.http.post<ActividadDTO>(
      this.ls.getUrlAccess('/notification/readActivity'),
      actividad
    );
  }

  transfer(plantilla: ActividadDTO): Observable<ActividadDTO> {
    return this.http.post<ActividadDTO>(
      this.ls.getUrlAccess('/notification/transfer'),
      plantilla
    );
  }

  usersToTransfer(documentId: string): Observable<UsuarioDTO[]> {
    return this.http.post<UsuarioDTO[]>(
      this.ls.getUrlAccess('/users/userToTransfer/' + documentId),
      null
    );
  }


}
