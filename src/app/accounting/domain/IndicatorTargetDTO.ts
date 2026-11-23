import { BasicDTO } from "app/shared/shared.domain";

export interface IndicatorTargetDTO extends BasicDTO {
    nombre: string;
    valorSuperior: number | null;
    valorInferior: number | null;
    color: string;
    indicador?: string;
    prioridad?: number;
}
