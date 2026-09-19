import { BasicParamDTO } from 'app/shared/shared.domain';

export class TreeNodeDTO extends BasicParamDTO {
    static readonly ORGANIZACION = 'ORGANIZACION';
    static readonly PROCESO_MACRO = 'PROCESO_MACRO';
    static readonly PROCESO = 'PROCESO';
    static readonly ESTADO = 'ESTADO';
    static readonly TRANSICION = 'TRANSICION';
    static readonly PLANTILLA = 'PLANTILLA';
    static readonly PLANTILLA_MODIFICACION = 'PLANTILLA_MODIFICACION';
    static readonly PLANTILLA_ANULACION = 'PLANTILLA_ANULACION';
    static readonly PLANTILLA_ACTIVACION = 'PLANTILLA_ACTIVACION';
    static readonly CAMPO = 'CAMPO';
    static readonly REPORTE = 'REPORTE';
    static readonly ROL = 'ROL';
    static readonly API = 'API';
    static readonly MENSAJE = 'MENSAJE';
    nombre: string;
    codigo: string;
    imagen: string;
    tipo: string;
    camino: string;
    dato: any;
    hijos: TreeNodeDTO[];
}