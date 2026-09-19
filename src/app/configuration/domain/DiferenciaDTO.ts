import { TreeNodeDTO } from './TreeNodeDTO';

export class DiferenciaDTO {
    static readonly CREAR = 'CREAR';
    static readonly ACTUALIZAR = 'ACTUALIZAR';
    static readonly SIN_DIFERENCIA = 'SIN_DIFERENCIA';
    tipoDiferencia: string;
    nodo: TreeNodeDTO;
    camino: string;
    camposDiferentes: string[];
    hijos: DiferenciaDTO[];
}