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
    { label: 'Web Services',        route: '/config/web-services' },
    { label: 'Ejecuciones WS',      route: '/config/web-service-executions' },
    { label: 'Mensajes',            route: '/config/messages' },
    { label: 'Plantillas Msg',      route: '/config/message-templates' },
    { label: 'Plantillas Doc',      route: '/config/document-templates' },
    { label: 'Tareas Auto',         route: '/config/auto-tasks' },
    { label: 'Procesos',            route: '/config/processes' },
    { label: 'Organizaciones',      route: '/config/organizations' },
    { label: 'Consecutivos',        route: '/config/consecutives' },
    { label: 'Servidores',          route: '/config/servers' },
    { label: 'Valores',             route: '/config/property-values' },
    { label: 'Indicadores',         route: '/config/indicators' },
    { label: 'Sync Árbol',          route: '/config/tree-compare' },
  ];
}
