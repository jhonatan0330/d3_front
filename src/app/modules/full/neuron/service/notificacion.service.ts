import { Injectable } from '@angular/core';
import { ActividadDTO, PedidoVentaDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { PlantillaHelper } from 'app/shared/helpers/plantilla-helper';
import { JwtAuthService } from 'app/authentication/jwt-auth.service';
import Swal from 'sweetalert2';
import { ApiService } from './api.service';
import { TemplateService } from './template.service';
import { UtilsService } from './utils.service';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {

  notifications: ActividadDTO[] = []
  constructor(
    private jwtService: JwtAuthService,
    private apiService: ApiService,
    private utilsService: UtilsService,
    private templateService: TemplateService) { }

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
  }
}
