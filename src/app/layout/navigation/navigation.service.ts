import { Injectable, signal, WritableSignal } from '@angular/core';
import { Navigation } from 'app/layout/navigation/navigation.types';
import { FuseNavigationItem } from 'app/layout/layout.types';

@Injectable({
    providedIn: 'root'
})
export class NavigationService {
    private _navigation: WritableSignal<Navigation> = signal(null!);

    constructor() {
        this.generate();
    }

    get navigation(): Navigation {
        return this._navigation();
    }

    generate() {
        const localNavigation: FuseNavigationItem[] = [
            {
                id   : 'apps.main',
                title: 'Inicio',
                type : 'basic',
                icon : 'heroicons_outline:home',
                link : '/main'
            }];

        const compactNavigation: FuseNavigationItem[] = [
            {
                id   : 'apps.main',
                title: 'Inicio',
                type : 'basic',
                icon : 'heroicons_outline:home',
                link : '/main'
            }];

        // CONFIGURACIÓN
        const configNavItem: FuseNavigationItem[] = [
            {
                id: 'config.main',
                title: 'Configuración',
                type: 'basic',
                icon: 'heroicons_outline:cog-6-tooth',
                link: '/config'
            }
        ];

        if (configNavItem && configNavItem.length !== 0) {
            const configItemLocal: FuseNavigationItem = {
                id: 'config',
                title: 'Configuración',
                type: 'group',
                icon: 'heroicons_outline:cog-6-tooth',
                children: configNavItem
            };
            const configItemCompact: FuseNavigationItem = {
                id: 'config',
                title: 'Configuración',
                type: 'aside',
                icon: 'heroicons_outline:cog-6-tooth',
                children: configNavItem
            };
            localNavigation.push(configItemLocal);
            compactNavigation.push(configItemCompact);
        }

        // PROCESOS (existentes de Flex)
        const processNavItem: FuseNavigationItem[] = [];
        // Note: Process loading would need to be injected via service

        const navigation = {
            default: [...localNavigation],
            compact: [...compactNavigation],
            futuristic: [...localNavigation],
            horizontal: [...localNavigation],
        };
        this._navigation.set(navigation);
    }
}