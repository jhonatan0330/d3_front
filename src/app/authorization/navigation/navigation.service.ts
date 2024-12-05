import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, } from 'rxjs';
import { Navigation } from 'app/authorization/navigation/navigation.types';
import { FuseNavigationItem, FuseNavigationService, FuseVerticalNavigationComponent } from '@fuse/components/navigation';
import { compactNavigation, defaultNavigation, futuristicNavigation, horizontalNavigation } from 'app/authorization/navigation/data';
import { DocumentoPlantillaDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import { ModuloDTO } from '../authorization.domain';

@Injectable({
    providedIn: 'root'
})
export class NavigationService {
    private _navigation: ReplaySubject<Navigation> = new ReplaySubject<Navigation>(1);

    private readonly _compactNavigation: FuseNavigationItem[] = compactNavigation;
    private readonly _defaultNavigation: FuseNavigationItem[] = defaultNavigation;
    private readonly _futuristicNavigation: FuseNavigationItem[] = futuristicNavigation;
    private readonly _horizontalNavigation: FuseNavigationItem[] = horizontalNavigation;

    /**
     * Constructor
     */
    constructor(private _fuseNavigationService: FuseNavigationService) {
        this.generate(null, null, null);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for navigation
     */
    get navigation$(): Observable<Navigation> {
        return this._navigation.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    generate(process: DocumentoPlantillaDTO[], modules: ModuloDTO[], templates: DocumentoPlantillaDTO[]) {


        const localNavigation: FuseNavigationItem[] = [
            {
                id   : 'apps.main',
                title: 'Inicio',
                type : 'basic',
                icon : 'heroicons_outline:home',
                link : '/main'
            }]
           
        if (!templates) {
            this._defaultNavigation[1].children = [];
            this._defaultNavigation[2].children = [];
            this._defaultNavigation[3].children = [];
            this._defaultNavigation[4].children = [];
            return;
        }

        if (templates) {
             const items: FuseNavigationItem[] = [];
            templates.forEach((element: DocumentoPlantillaDTO) => {
                if (PlantillaHelper.buscarPropiedad(element.propiedades, PlantillaHelper.PLANTILLA_ACCESO_RAPIDO) && PlantillaHelper.buscarPropiedad(element.propiedades, PlantillaHelper.PERMISO_PLANTILLA_CREAR)) {
                    const newItem: FuseNavigationItem = {
                        id: element.llaveTabla,
                        title: element.nombre[0].toUpperCase() + element.nombre.substring(1).toLowerCase(),
                        type: 'basic',
                        link: '/main/' + element.llaveTabla,
                        image: element.imagen
                    };
                    items.push(newItem);
                }
            });
            if(items && items.length!==0){
                const moduleItemLocal:FuseNavigationItem = {
                    id      : 'rapid',
                    title   : 'Accesos rapidos',
                    type    : 'group',
                    children: items
                };
                localNavigation.push(moduleItemLocal);
            }
        }

        const processNavItem: FuseNavigationItem[] = [];
        if (process) {
            
            process.forEach((process: DocumentoPlantillaDTO) => {
                let idProcess = (process.proceso == null) ? process.codigo : process.proceso;
                const newItem: FuseNavigationItem = {
                    id: idProcess,
                    title: process.nombre[0].toUpperCase() + process.nombre.substring(1).toLowerCase(),
                    type: 'basic',
                    image: process.imagen,
                    link: '/list/process_crud/' + idProcess
                };
                processNavItem.push(newItem);
            });
            if(processNavItem && processNavItem.length!==0){
                const processItemLocal:FuseNavigationItem = {
                    id      : 'process',
                    title   : 'Procesos de Negocio',
                    type    : 'group',
                    children: processNavItem
                };
                localNavigation.push(processItemLocal);
            }
            
        }
        this._defaultNavigation[1].children = processNavItem;

    


        const moduleNavItem: FuseNavigationItem[] = [];
        if (modules) {
            modules.forEach((module: ModuloDTO) => {
                if (module.moduloUrl && module.moduloUrl.startsWith("/")) {
                    const newItem: FuseNavigationItem = {
                        id: module.llaveTabla,
                        title: module.nombre[0].toUpperCase() + module.nombre.substring(1).toLowerCase(),
                        type: 'basic',
                        link: module.moduloUrl,
                    };
                    if (module.imagen) {
                        newItem.image = module.imagen;
                    } else {
                        newItem.icon = 'heroicons_outline:check-circle';
                    }
                    moduleNavItem.push(newItem);
                }
            });
            if(moduleNavItem && moduleNavItem.length!==0){
                const moduleItemLocal:FuseNavigationItem = {
                    id      : 'apps',
                    title   : 'Aplicaciones',
                    type    : 'group',
                    children: moduleNavItem
                };
                localNavigation.push(moduleItemLocal);
            }
            
        }
        this._defaultNavigation[2].children = moduleNavItem;

        if (templates) {
            const templateNavItem: FuseNavigationItem[] = [];
            templates.forEach((element: DocumentoPlantillaDTO) => {
                if (PlantillaHelper.buscarPropiedad(element.propiedades, PlantillaHelper.PERMISO_PLANTILLA_LISTAR_MENU)) {
                    const newItem: FuseNavigationItem = {
                        id: element.llaveTabla,
                        title: element.nombre[0].toUpperCase() + element.nombre.substring(1).toLowerCase(),
                        type: 'basic',
                        link: '/list/list/' + element.llaveTabla,
                        image: element.imagen
                    };
                    templateNavItem.push(newItem);
                }
            });
            if(templateNavItem && templateNavItem.length!==0){
                const moduleItemLocal:FuseNavigationItem = {
                    id      : 'modulos',
                    title   : 'Modulos',
                    type    : 'group',
                    children: templateNavItem
                };
                localNavigation.push(moduleItemLocal);
            }
            this._defaultNavigation[3].children = templateNavItem;

            const reportNavItem: FuseNavigationItem[] = [];
            templates.forEach((element: DocumentoPlantillaDTO) => {
                if (PlantillaHelper.buscarPropiedad(element.propiedades, PlantillaHelper.PLANTILLA_TIPO_REPORTE) && PlantillaHelper.buscarPropiedad(element.propiedades, PlantillaHelper.PERMISO_PLANTILLA_CREAR)) {
                    const newItem: FuseNavigationItem = {
                        id: element.llaveTabla,
                        title: element.nombre[0].toUpperCase() + element.nombre.substring(1).toLowerCase(),
                        type: 'basic',
                        link: '/main/' + element.llaveTabla,
                        image: element.imagen
                    };
                    reportNavItem.push(newItem);
                }
            });
            if(reportNavItem && reportNavItem.length!==0){
                const moduleItemLocal:FuseNavigationItem = {
                    id      : 'report',
                    title   : 'Reportes',
                    type    : 'group',
                    children: reportNavItem
                };
                localNavigation.push(moduleItemLocal);
            }
            this._defaultNavigation[4].children = reportNavItem;
        }

        // Fill compact navigation children using the default navigation
        this._compactNavigation.forEach((compactNavItem) => {
            this._defaultNavigation.forEach((defaultNavItem) => {
                if (defaultNavItem.id === compactNavItem.id) {
                    //compactNavItem.children = cloneDeep(defaultNavItem.children);
                    compactNavItem.children = defaultNavItem.children;
                }
            });
        });

        // Fill futuristic navigation children using the default navigation
        this._futuristicNavigation.forEach((futuristicNavItem) => {
            this._defaultNavigation.forEach((defaultNavItem) => {
                if (defaultNavItem.id === futuristicNavItem.id) {
                    //futuristicNavItem.children = cloneDeep(defaultNavItem.children);
                    futuristicNavItem.children = defaultNavItem.children;
                }
            });
        });

        // Fill horizontal navigation children using the default navigation
        this._horizontalNavigation.forEach((horizontalNavItem) => {
            this._defaultNavigation.forEach((defaultNavItem) => {
                if (defaultNavItem.id === horizontalNavItem.id) {
                    //horizontalNavItem.children = cloneDeep(defaultNavItem.children);
                    horizontalNavItem.children = defaultNavItem.children;
                }
            });
        });
        const navigation = {
            compact: [...this._compactNavigation],
            default: [...localNavigation],
            futuristic: [...this._futuristicNavigation],
            horizontal: [...this._horizontalNavigation]
            //compact   : this._compactNavigation,
            //default   : this._defaultNavigation,
            //futuristic: this._futuristicNavigation,
            //horizontal: this._horizontalNavigation
        }
        this._navigation.next(navigation);

        const nav = this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>('mainNavigation');
        if (nav) { nav.refresh(); }
    }

}
