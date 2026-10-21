import { BasicParamDTO } from 'app/shared/shared.domain';

export class TreeNodeDTO extends BasicParamDTO {
    static readonly ORGANIZACION = 'ORGANIZACION';
    static readonly PROCESO = 'PROCESO';
    static readonly ESTADO = 'ESTADO';
    static readonly TRANSICION = 'TRANSICION';
    static readonly PLANTILLA = 'PLANTILLA';
    static readonly CAMPO = 'CAMPO';
    static readonly REPORTE = 'REPORTE';
    static readonly API = 'API';
    nombre: string;
    codigo: string;
    imagen: string;
    tipo: string;
    categoria: string;
    camino: string;
    tieneHijos: boolean;
    totalHijos: number;
    hijos: TreeNodeDTO[];
}