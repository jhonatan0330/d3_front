import { BasicDTO } from "app/shared/shared.domain";

export class TarifaDTO extends BasicDTO {
	tarifario: string;
	tarifarioNombre: string;
	tarifarioDocumento: string;
	producto: string;
	productoDTO: string;
	productoNombre: string;
	valorMinimo: number;
	valor: number;
	valorMaximo: number;
	cantidadMinima: number;
	cantidadMaxima: number;
	totalMinimo: number;
	createdAt: Date;
	createdUser: string;
	updatedAt: Date;
	updatedUser: string;
}
