import { BasicFilterDTO } from 'app/shared/shared.domain';

export class DocumentoPlantillaFilterDTO extends BasicFilterDTO {
    nombre: string;
    consecutivo: string;
    imagen: string;
    codigo: string;
    proceso: string;
    tipo: string;
    padre: string;
}