/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
    {
        id      : 'apps',
        title   : 'Aplicaciones',
        type    : 'group',
        icon    : 'heroicons_outline:home',
        children: [
            {
                id   : 'dashboards.project',
                title: 'Profile',
                type : 'basic',
                icon : 'heroicons_outline:user-circle',
                link : '/profile'
            },
            {
                id   : 'user-interface.advanced-search',
                title: 'Busquedas Avanzadas',
                type : 'basic',
                icon : 'heroicons_outline:search-circle',
                link : '/main'
            },
            {
                id   : 'apps.academy',
                title: 'Cursos',
                type : 'basic',
                icon : 'heroicons_outline:academic-cap',
                link : '/apps/academy'
            },
            {
                id   : 'apps.chat',
                title: 'Chat',
                type : 'basic',
                icon : 'heroicons_outline:chat-alt',
                link : '/apps/chat'
            },
            {
                id   : 'apps.mailbox',
                title: 'Correo',
                type : 'basic',
                icon : 'heroicons_outline:mail',
                link : '/apps/mailbox',
                badge: {
                    title  : '0',
                    classes: 'px-2 bg-pink-600 text-white rounded-full'
                }
            },
            {
                id   : 'apps.tasks',
                title: 'Tareas',
                type : 'basic',
                icon : 'heroicons_outline:check-circle',
                link : '/apps/tasks'
            }
        ]
    }
   
];
export const compactNavigation: FuseNavigationItem[] = [
    {
        id      : 'apps',
        title   : 'Aplicaciones',
        type    : 'aside',
        icon    : 'heroicons_outline:qrcode',
        children: [] // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    }
];
export const futuristicNavigation: FuseNavigationItem[] = [
    {
        id      : 'apps',
        title   : 'Aplicaciones',
        type    : 'group',
        children: [] // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    }
];
export const horizontalNavigation: FuseNavigationItem[] = [
    {
        id      : 'apps',
        title   : 'Aplicaciones',
        type    : 'group',
        icon    : 'heroicons_outline:qrcode',
        children: [] // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    }
];
