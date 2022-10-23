import { Component, OnInit, Input } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ActividadDTO } from 'app/model/sw42.domain';
import { NotificacionService } from 'app/service/notificacion.service';
import { TemplateService } from 'app/service/template.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html'
})
export class NotificationsComponent implements OnInit {
  @Input() notificPanel;

  constructor(
    private router: Router,
    public notificationService:NotificacionService,
    private templateService:TemplateService
    ) {}

  ngOnInit() {
    this.router.events.subscribe((routeChange) => {
        if (routeChange instanceof NavigationEnd) {
          this.notificPanel.close();
        }
    });
  }

  getColor(pEstado: string) {
    return this.templateService.getColor(pEstado);
  }

  clearAll(e) {
    e.preventDefault();
    this.notificationService.notifications = [];
  }

  public goToCalendar() {
    this.router.navigateByUrl('calendar');
  }

  openDocument(document: ActividadDTO) {
    if(!document.fechaLeido){
      this.notificationService.readActivity(document);
    }else{
      this.notificationService.openDialog(document.documentoDTO.plantilla, document.documentoDTO.llaveTabla
        , document.documentoDTO.serverUrl);
    }
  }

}
