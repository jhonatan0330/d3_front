import { BasicFilterDTO } from 'app/shared/shared.domain';

export class ArbolConfiguracionFilterDTO extends BasicFilterDTO {
    static readonly PROFUNDIDAD_COMPLETA = 'COMPLETA';
    static readonly PROFUNDIDAD_SIMPLE = 'SIMPLE';
    profundidad: string;
    listarPropiedades: boolean;
}