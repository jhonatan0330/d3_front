export interface IndicatorTargetDTO {
    key?: string;
    nombre: string;
    valorSuperior: number | null;
    valorInferior: number | null;
    color: string;
    indicador?: string;
    state?: string;
    prioridad?: number;
}
