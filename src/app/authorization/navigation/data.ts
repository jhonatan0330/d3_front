/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
    {
        id      : 'process',
        title   : 'Procesos de Negocio',
        type    : 'group',
        children: []
    },
    {
        id      : 'apps',
        title   : 'Aplicaciones',
        type    : 'group',
        children: [
            {
                id   : 'apps.main',
                title: 'Inicio',
                type : 'basic',
                icon : 'heroicons_outline:home',
                link : '/main'
            }
            ,{
                id   : 'apps.contacts',
                title: 'Mapas',
                type : 'basic',
                icon : 'heroicons_outline:map',
                link : '/maps'
            },
            {
                id   : 'pages.settings',
                title: 'Mi cuenta',
                type : 'basic',
                icon : 'heroicons_outline:cog',
                link : '/settings'
            },
            {
                id   : 'apps.tasks',
                title: 'TO-DO',
                type : 'basic',
                icon : 'heroicons_outline:check-circle',
                link : '/tasks'
            },
            {
                id   : 'apps.designer',
                title: 'Diseñador',
                type : 'basic',
                icon : 'heroicons_outline:cube-transparent',
                link : '/designer'
            },
            {
                id   : 'apps.academy',
                title: 'Academia',
                type : 'basic',
                icon : 'heroicons_outline:academic-cap',
                link : '/academy'
            },
            {
                id   : 'apps.inventary',
                title: 'Inventario',
                type : 'basic',
                icon : 'heroicons_outline:archive',
                link : '/inventory'
            },
            {
                id   : 'apps.accounting',
                title: 'Indicadores',
                type : 'basic',
                icon : 'heroicons_outline:chart-pie',
                link : '/account'
            },
            {
                id  : 'divider-1',
                type: 'divider'
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
