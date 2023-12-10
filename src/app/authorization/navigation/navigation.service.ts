import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { Observable, ReplaySubject, } from 'rxjs';
import { Navigation } from 'app/authorization/navigation/navigation.types';
import { FuseNavigationItem } from '@fuse/components/navigation';
import { compactNavigation, defaultNavigation, futuristicNavigation, horizontalNavigation } from 'app/authorization/navigation/data';
import { DocumentoPlantillaDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import { ModuloDTO } from '../authorization.domain';

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
        this.generate(null,null,null);
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

    generate(process: DocumentoPlantillaDTO[], modules: ModuloDTO[], templates: DocumentoPlantillaDTO[]) {

        if(process){
            const processNavItem: FuseNavigationItem[] = [];
            process.forEach((process:DocumentoPlantillaDTO)=>{
                const newItem: FuseNavigationItem = {
                    id   : process.proceso,
                    title: process.nombre[0].toUpperCase() + process.nombre.substring(1).toLowerCase(),
                    type : 'basic',
                    image: process.imagen,
                    link : '/list/process_crud/' + process.proceso
                };
                processNavItem.push(newItem);
            });
            if(process.length===0){
                //this._defaultNavigation.shift()
            }else{
                this._defaultNavigation[1].children = cloneDeep(processNavItem);
            }
        }
        
        if(modules){
            const moduleNavItem: FuseNavigationItem[] = [];
            modules.forEach((module:ModuloDTO)=>{
                if(module.moduloUrl && module.moduloUrl.startsWith("/")){
                    const newItem: FuseNavigationItem = {
                        id   : module.llaveTabla,
                        title: module.nombre[0].toUpperCase() + module.nombre.substring(1).toLowerCase(),
                        type : 'basic',
                        link : module.moduloUrl,
                    };
                    if(module.imagen){
                        newItem.image = module.imagen;
                    }else{
                        newItem.icon = 'heroicons_outline:check-circle';
                    }
                    moduleNavItem.push(newItem);
                }
            });
            this._defaultNavigation[2].children = cloneDeep(moduleNavItem);
        }

        if(templates){
            const templateNavItem: FuseNavigationItem[] = [];
            templates.forEach((element:DocumentoPlantillaDTO)=>{
                if (PlantillaHelper.buscarPropiedad(element.propiedades, PlantillaHelper.PERMISO_PLANTILLA_LISTAR_MENU)) {
                    const newItem: FuseNavigationItem = {
                        id   : element.llaveTabla,
                        title: element.nombre[0].toUpperCase() + element.nombre.substring(1).toLowerCase(),
                        type : 'basic',
                        link : '/list/list/' + element.llaveTabla,
                        image: element.imagen
                    };
                    templateNavItem.push(newItem);
                  }
            });
            this._defaultNavigation[3].children = cloneDeep(templateNavItem);
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
