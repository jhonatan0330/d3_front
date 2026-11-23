import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

interface ConfigTab {
  label: string;
  route: string;
}

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './config.component.html'
})
export class ConfigComponent {
  tabs: ConfigTab[] = [
    { label: 'Indicadores',         route: '/config/indicators' },
    { label: 'Plantillas Doc',      route: '/config/document-templates' },
    { label: 'Web Services',        route: '/config/web-services' },
    { label: 'Procesos',            route: '/config/processes' },
    { label: 'Organizaciones',      route: '/config/organizations' },
    { label: 'Ejecuciones WS',      route: '/config/web-service-executions' },
    { label: 'Errores',             route: '/config/errors' },
    { label: 'Mensajes',            route: '/config/messages' },
    { label: 'Tareas Auto',         route: '/config/auto-tasks' },
    { label: 'Consecutivos',        route: '/config/consecutives' },
    { label: 'Servidores',          route: '/config/servers' },
    { label: 'Valores',             route: '/config/property-values' },
  ];
}
