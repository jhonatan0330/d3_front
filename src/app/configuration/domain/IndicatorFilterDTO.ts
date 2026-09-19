import { BasicFilterDTO } from 'app/shared/shared.domain';

export class IndicatorFilterDTO extends BasicFilterDTO {
    nombre: string;
    codigo: string;
    proceso: string;
}