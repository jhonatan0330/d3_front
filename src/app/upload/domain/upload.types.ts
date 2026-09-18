import { BasicDTO } from "app/shared/shared.domain";

export class CargaArchivoDTO extends BasicDTO {
    servidor: string;
    size: number;
    url: string;
    fechaInicio: Date;
    fechaFin: Date;
    error: string;
    usuario: string;
}