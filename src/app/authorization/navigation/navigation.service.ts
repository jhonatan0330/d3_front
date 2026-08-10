import { Injectable, signal, WritableSignal } from '@angular/core';
import { Navigation } from 'app/authorization/navigation/navigation.types';
import { FuseNavigationItem } from '@fuse/components/navigation';
import { DocumentoPlantillaDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import { PropiedadDTO } from 'app/shared/shared.domain';

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

        if (!templates) {
            return;
        }

        // ACCESOS RAPIDOS
       /* if (templates) {
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
                    icon    : 'heroicons_outline:bolt',
                    children: items
                };
                const moduleItemCompact:FuseNavigationItem = {
                    id      : 'rapid',
                    title   : 'Accesos rapidos',
                    type    : 'aside',
                    icon    : 'heroicons_outline:bolt',
                    children: items
                };
                localNavigation.push(moduleItemLocal);
                compactNavigation.push(moduleItemCompact);
            }
        }*/

        // PROCESOS
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

        // MODULOS
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
                    icon    : 'heroicons_outline:table-cells',
                    children: templateNavItem
                };
                const moduleItemCompact:FuseNavigationItem = {
                    id      : 'modulos',
                    title   : 'Modulos',
                    type    : 'aside',
                    icon    : 'heroicons_outline:table-cells',
                    children: templateNavItem
                };
                localNavigation.push(moduleItemLocal);
                compactNavigation.push(moduleItemCompact);
            }

        // REPORTES
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
                    icon    : 'heroicons_outline:newspaper',    
                    children: reportNavItem
                };
                const moduleItemCompact:FuseNavigationItem = {
                    id      : 'report',
                    title   : 'Reportes',
                    type    : 'aside',
                    icon    : 'heroicons_outline:newspaper',
                    children: reportNavItem
                };
                localNavigation.push(moduleItemLocal);
                compactNavigation.push(moduleItemCompact);
            }
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
