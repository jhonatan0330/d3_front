import { NodoArbolDTO } from './NodoArbolDTO';

export class SincronizacionNodoDTO {
    static readonly CREAR = 'CREAR';
    static readonly ACTUALIZAR = 'ACTUALIZAR';
    static readonly OMITIR = 'OMITIR';
    nodo?: NodoArbolDTO;
    camino: string;
    accion: string;
    incluirHijos: boolean;
    crearAncestros?: boolean;
    arbolId?: string;
}
