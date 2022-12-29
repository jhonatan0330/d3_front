import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, ReplaySubject, tap } from 'rxjs';
import { ActividadDTO } from 'app/notification/notification.types';
import { LocalStoreService } from 'app/shared/services/local-store.service';

@Injectable({
    providedIn: 'root'
})
export class NotificationsService
{
    private _notifications: ReplaySubject<ActividadDTO[]> = new ReplaySubject<ActividadDTO[]>(1);

    constructor(private http: HttpClient,
        private ls: LocalStoreService)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for notifications
     */
    get notifications$(): Observable<ActividadDTO[]>
    {
        return this._notifications.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get all notifications
     */
    getAll(_server: string): Observable<ActividadDTO[]>
    {
        return this.http.get<ActividadDTO[]>(
            this.ls.getUrlAccess('/document/getUserActivities', _server)
          ).pipe(
            tap((notifications) => {
                this._notifications.next(notifications);
            })
        );
    }
    /*
      listUserActivities(_server: string): Observable<ActividadDTO[]> {
    return this.http.get<ActividadDTO[]>(
      this.ls.getUrlAccess('/document/getUserActivities', _server)
    );
  }

  readActivity(actividad: ActividadDTO, _server: string): Observable<ActividadDTO> {
    return this.http.post<ActividadDTO>(
      this.ls.getUrlAccess('/document/readActivity', _server),
      actividad
    );
  }*/

  reasignar(plantilla: ActividadDTO, _server: string): Observable<ActividadDTO> {
    return this.http.post<ActividadDTO>(
      this.ls.getUrlAccess('/rest/reasignar', _server),
      plantilla
    );
  }

    /**
     * Create a notification
     *
     * @param notification
     */
    create(notification: ActividadDTO): Observable<ActividadDTO>
    {
        /*
        return this.notifications$.pipe(
            take(1),
            switchMap(notifications => this._httpClient.post<Notification>('api/common/notifications', {notification}).pipe(
                map((newNotification) => {

                    // Update the notifications with the new notification
                    this._notifications.next([...notifications, newNotification]);

                    // Return the new notification from observable
                    return newNotification;
                })
            ))
        );*/
        return null;
    }

    /**
     * Update the notification
     *
     * @param id
     * @param notification
     */
    update(id: string, notification: ActividadDTO): Observable<ActividadDTO>
    {
        /*
        return this.notifications$.pipe(
            take(1),
            switchMap(notifications => this._httpClient.patch<Notification>('api/common/notifications', {
                id,
                notification
            }).pipe(
                map((updatedNotification: Notification) => {

                    // Find the index of the updated notification
                    const index = notifications.findIndex(item => item.id === id);

                    // Update the notification
                    notifications[index] = updatedNotification;

                    // Update the notifications
                    this._notifications.next(notifications);

                    // Return the updated notification
                    return updatedNotification;
                })
            ))
        );
        */
       return null;
    }


    /**
     * Mark all notifications as read
     */
    markAllAsRead(): Observable<boolean>
    {
        /*return this.notifications$.pipe(
            take(1),
            switchMap(notifications => this._httpClient.get<boolean>('api/common/notifications/mark-all-as-read').pipe(
                map((isUpdated: boolean) => {

                    // Go through all notifications and set them as read
                    notifications.forEach((notification, index) => {
                        notifications[index].read = true;
                    });

                    // Update the notifications
                    this._notifications.next(notifications);

                    // Return the updated status
                    return isUpdated;
                })
            ))
        );*/
        return null;
    }

/*
    getNotifications() {
        this.apiService.listUserActivities(null).subscribe({
          next: (n: ActividadDTO[]) => {
            this.notifications = [];
            this.handlerNotificationExternal(n);
            if(this.templateService.conectionTemplates){
              for (let i = 0; i < this.templateService.conectionTemplates.length; i++) {
                const element = this.templateService.conectionTemplates[i];
                this.apiService.listUserActivities(element.servidorUrl).subscribe({
                  next: (list2: ActividadDTO[]) => {
                    this.handlerNotificationExternal(list2, element.servidorUrl);
                  }
                });
              }
            }
            this.showMessage();
          }
        });
      }
    
      handlerNotificationExternal(activities: ActividadDTO[], url: string = null){
        if(activities){
          for (let index = 0; index < activities.length; index++) {
            const element = activities[index];
            if (element.documentoDTO) {
              element.documentoDTO.serverUrl = url;
            }
          }
          this.notifications = this.notifications.concat(activities);
        }
      }
    
      showMessage(){
        if (this.notifications && this.notifications.length!==0){
          const sinleer = this.notifications.filter(x=> !x.fechaLeido);
          let aviso = 'Tienes (' + this.notifications.length.toString() + ') mensajes\n';
          if(sinleer && sinleer.length!==0) { aviso = aviso + ' (' + sinleer.length.toString() + ') mensajes sin leer'; }
          Swal.fire({
            position: 'top-end',
            title: aviso ,
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            backdrop: false
          });
          if(sinleer && sinleer.length!==0) {
            if (PlantillaHelper.buscarPropiedad(this.jwtService.company.propiedades, PlantillaHelper.FORCE_NOTIFICATION)){
              this.readActivity(sinleer[0]);
             }
          }
        }
      }
    
      openDialog(plantilla: string, id: string, server: string) {
        const pedidoVenta: PedidoVentaDTO = new PedidoVentaDTO();
        pedidoVenta.plantilla = plantilla;
        pedidoVenta.llaveTabla = id;
        pedidoVenta.serverUrl = server;
        this.utilsService.modalWithParams(pedidoVenta).subscribe(() => {
          this.getNotifications();
        });
      }
    
      readActivity(actividad: ActividadDTO) {
        this.apiService.readActivity(actividad, actividad.documentoDTO.serverUrl).subscribe({
          next: (n: ActividadDTO) => {
            this.openDialog(n.documentoDTO.plantilla, n.documento, actividad.documentoDTO.serverUrl);
          }
        });
      }*/
}
