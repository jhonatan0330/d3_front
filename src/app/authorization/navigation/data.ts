/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
    {
        id   : 'apps.main',
        title: 'Inicio',
        type : 'basic',
        icon : 'heroicons_outline:home',
        link : '/main'
    },
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
        children: []
    },
    {
        id      : 'list',
        title   : 'Modulos',
        type    : 'group',
        children: []
    },
    {
        id  : 'divider-1',
        type: 'divider'
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
