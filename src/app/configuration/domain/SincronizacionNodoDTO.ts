import { TreeNodeDTO } from './TreeNodeDTO';

export class SincronizacionNodoDTO {
    static readonly CREAR = 'CREAR';
    static readonly ACTUALIZAR = 'ACTUALIZAR';
    static readonly OMITIR = 'OMITIR';
    nodo: TreeNodeDTO;
    camino: string;
    accion: string;
    incluirHijos: boolean;
    crearAncestros: boolean;
}
