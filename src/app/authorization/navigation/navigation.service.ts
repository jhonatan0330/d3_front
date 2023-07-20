import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { Observable, ReplaySubject, } from 'rxjs';
import { Navigation } from 'app/authorization/navigation/navigation.types';
import { FuseNavigationItem } from '@fuse/components/navigation';
import { compactNavigation, defaultNavigation, futuristicNavigation, horizontalNavigation } from 'app/authorization/navigation/data';
import { DocumentoPlantillaDTO } from 'app/modules/full/neuron/model/sw42.domain';

@Injectable({
    providedIn: 'root'
})
export class NavigationService
{
    private _navigation: ReplaySubject<Navigation> = new ReplaySubject<Navigation>(1);

    private readonly _compactNavigation: FuseNavigationItem[] = compactNavigation;
    private readonly _defaultNavigation: FuseNavigationItem[] = defaultNavigation;
    private readonly _futuristicNavigation: FuseNavigationItem[] = futuristicNavigation;
    private readonly _horizontalNavigation: FuseNavigationItem[] = horizontalNavigation;

    /**
     * Constructor
     */
    constructor()
    {
        this.generate(null);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for navigation
     */
    get navigation$(): Observable<Navigation>
    {
        return this._navigation.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    generate(process: DocumentoPlantillaDTO[]) {
        if(process){
            const processNavItem: FuseNavigationItem[] = [];
            process.forEach((process:DocumentoPlantillaDTO)=>{
                const newItem: FuseNavigationItem = {
                    id   : process.proceso,
                    title: process.nombre[0].toUpperCase() + process.nombre.substr(1).toLowerCase(),
                    type : 'basic',
                    image: process.imagen,
                    link : '/list/process_crud/' + process.proceso
                };
                processNavItem.push(newItem);
            });
            this._defaultNavigation[0].children = cloneDeep(processNavItem);
        }

        // Fill compact navigation children using the default navigation
        this._compactNavigation.forEach((compactNavItem) => {
            this._defaultNavigation.forEach((defaultNavItem) => {
                if ( defaultNavItem.id === compactNavItem.id )
                {
                    compactNavItem.children = cloneDeep(defaultNavItem.children);
                }
            });
        });

        // Fill futuristic navigation children using the default navigation
        this._futuristicNavigation.forEach((futuristicNavItem) => {
            this._defaultNavigation.forEach((defaultNavItem) => {
                if ( defaultNavItem.id === futuristicNavItem.id )
                {
                    futuristicNavItem.children = cloneDeep(defaultNavItem.children);
                }
            });
        });

        // Fill horizontal navigation children using the default navigation
        this._horizontalNavigation.forEach((horizontalNavItem) => {
            this._defaultNavigation.forEach((defaultNavItem) => {
                if ( defaultNavItem.id === horizontalNavItem.id )
                {
                    horizontalNavItem.children = cloneDeep(defaultNavItem.children);
                }
            });
        });
        const navigation = {
            compact   : cloneDeep(this._compactNavigation),
            default   : cloneDeep(this._defaultNavigation),
            futuristic: cloneDeep(this._futuristicNavigation),
            horizontal: cloneDeep(this._horizontalNavigation)
        }
        this._navigation.next(navigation);
    }
    
}
