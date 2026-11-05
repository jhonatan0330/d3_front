import { BasicNodoDTO } from 'app/shared/shared.domain';

export class NodoArbolDTO extends BasicNodoDTO {
    categoria: string;
    camino: string;
    tieneHijos: boolean;
    totalHijos: number;
    hijos: NodoArbolDTO[];
    att1: string;
    att2: string;
    att3: string;
}
