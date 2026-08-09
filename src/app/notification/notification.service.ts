import { Injectable, inject, signal, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ActividadDTO } from 'app/notification/notification.types';
import { LocalStoreService } from 'app/shared/local-store.service';
import { TemplateService } from 'app/modules/full/neuron/service/template.service';
import { UsuarioDTO } from 'app/authentication/authentication.domain';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private http = inject(HttpClient);
  private ls = inject(LocalStoreService);
  private templateService = inject(TemplateService);

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
  getAll(_server: string = null): Observable<ActividadDTO[]> {
    return this.http.get<ActividadDTO[]>(
      this.ls.getUrlAccess('/notification/getNotifications', _server)
    ).pipe(
      tap((notifications) => {
        this._notifications.set(notifications);
        this.getNotificationsFromOtherServers(notifications);
      })
    );
  }

  getNotificationsFromOtherServers(notificationMain:ActividadDTO[]){
      if(this.templateService.conectionTemplates){
        for (let i = 0; i < this.templateService.conectionTemplates.length; i++) {
          const element = this.templateService.conectionTemplates[i];
          // Al iniciar sesion por primera vez si el token no fuciona no me deja avanzar
          if(this.templateService.getTokenConnection(element.servidor)){
            this.http.get<ActividadDTO[]>(
              this.ls.getUrlAccess('/notification/getNotifications', element.llaveTabla)
            ).subscribe((notifications) => {
                this._notifications.set(notificationMain.concat(notifications));
              });
          }
          
        }
      }
  }

  clear(){
    this._notifications.set([]);
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
