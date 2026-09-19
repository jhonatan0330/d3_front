import { BasicParamDTO } from 'app/shared/shared.domain';

export class IndicatorDTO extends BasicParamDTO {
    nombre: string;
    codigo: string;
    proceso: string;
    imagen: string;
}