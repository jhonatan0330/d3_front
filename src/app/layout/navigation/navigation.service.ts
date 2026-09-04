import { Injectable, signal, WritableSignal } from '@angular/core';
import { Navigation } from 'app/layout/navigation/navigation.types';
import { FuseNavigationItem } from 'app/layout/layout.types';
import { DocumentoPlantillaDTO } from 'app/document/document.types';
import { PropiedadDTO } from 'app/shared/shared.domain';
import { PlantillaHelper } from 'app/shared/plantilla-helper';

@Injectable({
    providedIn: 'root'
})
export class NavigationService {
    private _navigation: WritableSignal<Navigation> = signal(null!);

    constructor() {
        this.generate(null!, null!, null!);
    }

    get navigation(): Navigation {
        return this._navigation();
    }

    generate(process: DocumentoPlantillaDTO[], modules: PropiedadDTO[], templates: DocumentoPlantillaDTO[]) {


        const localNavigation: FuseNavigationItem[] = [
            {
                id   : 'apps.main',
                title: 'Inicio',
                type : 'basic',
                icon : 'heroicons_outline:home',
                link : '/main'
            }]
        
        const compactNavigation: FuseNavigationItem[] = [
            {
                id   : 'apps.main',
                title: 'Inicio',
                type : 'basic',
                icon : 'heroicons_outline:home',
                link : '/main'
            }]

        if (!modules  && !process) {
            return;
        }


        // PROCESOS
        const processNavItem: FuseNavigationItem[] = [];
        if (process) {
            
            process.forEach((process: DocumentoPlantillaDTO) => {
                const idProcess = (process.proceso == null) ? process.codigo : process.proceso;
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
                    icon    : 'heroicons_outline:squares-plus',
                    children: processNavItem
                };
                const processItemCompact:FuseNavigationItem = {
                    id      : 'process',
                    title   : 'Procesos de Negocio',
                    type    : 'aside',
                    icon    : 'heroicons_outline:squares-plus',
                    children: processNavItem
                };
                localNavigation.push(processItemLocal);
                compactNavigation.push(processItemCompact);
            }
            
        }
    

        // APPS
        const moduleNavItem: FuseNavigationItem[] = [];
        if (modules) {
            modules.forEach((module: PropiedadDTO) => {
                    const _nameModule = (module.texto)?module.texto[0].toUpperCase() + module.texto.substring(1).toLowerCase():module.valor;
                    const newItem: FuseNavigationItem = {
                        id: module.llaveTabla,
                        title: _nameModule,
                        type: 'basic',
                        link: "/" + module.valor,
                    };
                    if (module.motivo) {
                        newItem.image = module.motivo;
                    } else {
                        newItem.icon = 'heroicons_outline:check-circle';
                    }
                    moduleNavItem.push(newItem);
                
            });
            if(moduleNavItem && moduleNavItem.length!==0){
                const moduleItemLocal:FuseNavigationItem = {
                    id      : 'apps',
                    title   : 'Apps',
                    type    : 'group',
                    icon    : 'heroicons_outline:squares-2x2',
                    children: moduleNavItem
                };
                const moduleItemCompact:FuseNavigationItem = {
                    id      : 'apps',
                    title   : 'Apps',
                    type    : 'aside',
                    icon    : 'heroicons_outline:squares-2x2',
                    children: moduleNavItem
                };
                localNavigation.push(moduleItemLocal);
                compactNavigation.push(moduleItemCompact);
            }
            
        }

        // PLANTILLAS (Crear)
        const createNavItem: FuseNavigationItem[] = [];
        if (templates && templates.length) {
            templates.forEach((template: DocumentoPlantillaDTO) => {
                if ((PlantillaHelper.buscarPropiedad(template.propiedades, PlantillaHelper.PERMISO_PLANTILLA_LISTAR_MENU)
                    && template.tipo == 'P')) {
                    const newItem: FuseNavigationItem = {
                        id: template.llaveTabla,
                        title: template.nombre,
                        type: 'basic',
                        image: template.imagen,
                        link: '/list/list/' + template.llaveTabla
                    };
                    createNavItem.push(newItem);
                }
            });
        }
        if (createNavItem && createNavItem.length !== 0) {
            const createItemLocal: FuseNavigationItem = {
                id      : 'crear',
                title   : 'Modulos',
                type    : 'group',
                icon    : 'heroicons_outline:plus',
                children: createNavItem
            };
            const createItemCompact: FuseNavigationItem = {
                id      : 'crear',
                title   : 'Crear',
                type    : 'aside',
                icon    : 'heroicons_outline:plus',
                children: createNavItem
            };
            localNavigation.push(createItemLocal);
            compactNavigation.push(createItemCompact);
        }

        const navigation = {
            default: [...localNavigation],

            compact: [...compactNavigation],
            futuristic: [...localNavigation],

            horizontal: [...localNavigation],
        }
        this._navigation.set(navigation);
    }

}
