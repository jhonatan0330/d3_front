import { BasicFilterDTO, BasicParamDTO } from "app/shared/shared.domain";

export class DocumentoPlantillaFilterDTO extends BasicFilterDTO {
    nombre: string;
    consecutivo: string;
    imagen: string;
    codigo: string;
    proceso: string;
    tipo: string;
    padre: string;
}

export class IndicatorDTO extends BasicParamDTO {
    nombre: string;
    codigo: string;
    proceso: string;
    imagen: string;
}

export class IndicatorFilterDTO extends BasicFilterDTO {
    nombre: string;
    codigo: string;
    proceso: string;
}

export class ArbolConfiguracionFilterDTO extends BasicFilterDTO {
    static readonly PROFUNDIDAD_COMPLETA = "COMPLETA";
    static readonly PROFUNDIDAD_SIMPLE = "SIMPLE";
    profundidad: string;
    listarPropiedades: boolean;
}

export class TreeNodeDTO extends BasicParamDTO {
    static readonly ORGANIZACION = "ORGANIZACION";
    static readonly PROCESO_MACRO = "PROCESO_MACRO";
    static readonly PROCESO = "PROCESO";
    static readonly ESTADO = "ESTADO";
    static readonly TRANSICION = "TRANSICION";
    static readonly PLANTILLA = "PLANTILLA";
    static readonly PLANTILLA_MODIFICACION = "PLANTILLA_MODIFICACION";
    static readonly PLANTILLA_ANULACION = "PLANTILLA_ANULACION";
    static readonly PLANTILLA_ACTIVACION = "PLANTILLA_ACTIVACION";
    static readonly CAMPO = "CAMPO";
    static readonly REPORTE = "REPORTE";
    static readonly ROL = "ROL";
    static readonly API = "API";
    static readonly MENSAJE = "MENSAJE";
    nombre: string;
    codigo: string;
    imagen: string;
    tipo: string;
    camino: string;
    dato: any;
    hijos: TreeNodeDTO[];
}

export class DiferenciaDTO {
    static readonly CREAR = "CREAR";
    static readonly ACTUALIZAR = "ACTUALIZAR";
    static readonly SIN_DIFERENCIA = "SIN_DIFERENCIA";
    tipoDiferencia: string;
    nodo: TreeNodeDTO;
    camino: string;
    camposDiferentes: string[];
    hijos: DiferenciaDTO[];
}

export class SeleccionSincronizacionDTO {
    static readonly CREAR = "CREAR";
    static readonly ACTUALIZAR = "ACTUALIZAR";
    static readonly OMITIR = "OMITIR";
    camino: string;
    accion: string;
    incluirHijos: boolean;
}

export class SincronizacionSeleccionadaDTO {
    arbol: TreeNodeDTO;
    selecciones: SeleccionSincronizacionDTO[];
}

export class CompararArbolRequest {
    arbol: TreeNodeDTO;
    filter: ArbolConfiguracionFilterDTO;
}