export const CONFIG_TIPO_LABELS: Record<string, string> = {
    ORGANIZACION: 'Organización',
    PROCESO_MACRO: 'Macroproceso',
    PROCESO: 'Proceso',
    ESTADO: 'Estado',
    TRANSICION: 'Transición',
    PLANTILLA: 'Plantilla',
    PLANTILLA_MODIFICACION: 'Plantilla Modificación',
    PLANTILLA_ANULACION: 'Plantilla Anulación',
    PLANTILLA_ACTIVACION: 'Plantilla Activación',
    CAMPO: 'Campo',
    REPORTE: 'Reporte',
    ROL: 'Rol',
    API: 'API',
    MENSAJE: 'Mensaje',
};

const TIPO_ORIGEN: Record<string, string> = {
    ORGANIZACION: 'O',
    PROCESO_MACRO: 'P',
    PROCESO: 'P',
    ESTADO: 'A',
    TRANSICION: 'T',
    PLANTILLA: 'L',
    PLANTILLA_MODIFICACION: 'L',
    PLANTILLA_ANULACION: 'L',
    PLANTILLA_ACTIVACION: 'L',
    CAMPO: 'C',
    REPORTE: 'E',
    API: 'W',
};

export function etiquetaTipoConfig(tipo: string): string {
    return CONFIG_TIPO_LABELS[tipo] ?? tipo;
}

export function mapTipoOrigen(tipo: string): string | null {
    return TIPO_ORIGEN[tipo] ?? null;
}

const CONFIG_TIPO_ICONOS: Record<string, string> = {
    ORGANIZACION: 'building',
    PROCESO_MACRO: 'folder',
    PROCESO: 'process',
    ESTADO: 'state',
    TRANSICION: 'transition',
    PLANTILLA: 'document',
    PLANTILLA_MODIFICACION: 'document',
    PLANTILLA_ANULACION: 'document',
    PLANTILLA_ACTIVACION: 'document',
    CAMPO: 'field',
    REPORTE: 'report',
    ROL: 'person',
    API: 'api',
    MENSAJE: 'message',
};

export function iconoTipoConfig(tipo: string): string | null {
    return CONFIG_TIPO_ICONOS[tipo] ?? null;
}

export const CONFIG_LEYENDA: ReadonlyArray<{ icon: string; label: string }> = [
    { icon: 'building', label: 'Organización' },
    { icon: 'folder', label: 'Macroproceso' },
    { icon: 'process', label: 'Proceso' },
    { icon: 'state', label: 'Estado' },
    { icon: 'diamond', label: 'Decisión / Iterador' },
    { icon: 'transition', label: 'Transición' },
    { icon: 'document', label: 'Plantilla' },
    { icon: 'field', label: 'Campo' },
    { icon: 'report', label: 'Reporte' },
    { icon: 'person', label: 'Rol' },
    { icon: 'api', label: 'API' },
    { icon: 'message', label: 'Mensaje' },
];
