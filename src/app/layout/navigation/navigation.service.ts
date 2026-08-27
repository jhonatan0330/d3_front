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

        const navigation = {
            default: [...localNavigation],
            compact: [...compactNavigation],
            futuristic: [...localNavigation],
            horizontal: [...localNavigation],
        };
        this._navigation.set(navigation);
    }
}