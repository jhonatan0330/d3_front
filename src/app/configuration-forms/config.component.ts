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
  template: `
    <div class="flex flex-col h-full">
      <div class="flex items-center gap-1 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        @for (tab of tabs; track tab.route) {
          <a [routerLink]="tab.route"
             routerLinkActive="border-primary text-primary"
             class="px-4 py-3 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 whitespace-nowrap transition-colors">
            {{ tab.label }}
          </a>
        }
      </div>
      <div class="flex-1 overflow-auto p-4">
        <router-outlet />
      </div>
    </div>
  `
})
export class ConfigComponent {
  tabs: ConfigTab[] = [
    { label: 'Web Services',    route: '/config/web-services' },
    { label: 'Mensajes',        route: '/config/messages' },
    { label: 'Plantillas Msg',  route: '/config/message-templates' },
    { label: 'Plantillas Doc',  route: '/config/document-templates' },
    { label: 'Tareas Auto',     route: '/config/auto-tasks' },
    { label: 'Procesos',        route: '/config/processes' },
    { label: 'Organizaciones',  route: '/config/organizations' },
    { label: 'Consecutivos',    route: '/config/consecutives' },
    { label: 'Servidores',      route: '/config/servers' },
    { label: 'Valores',         route: '/config/property-values' },
    { label: 'Propiedades',     route: '/config/properties' },
  ];
}
