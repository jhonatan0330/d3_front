import { BasicDTO } from "app/shared/shared.domain";

export class TarifaDTO extends BasicDTO {
	tarifario: string;
	tarifarioNombre: string;
	documento: string;
	producto: string;
	productoNombre: string;
	recurso: string;
	recursoNombre: string;
	rangoPrecios: boolean;
	valorMinimo: number;
	valor: number;
	valorMaximo: number;
	cantidadMinima: number;
	cantidadMaxima: number;
	totalMinimo: number;
	dimension2: string;
	dimension2Nombre;
	dimension3: string;
	dimension3Nombre: string;
	dimension4: string;
	dimension4Nombre: string;
	createdAt: Date;
	createdUser: string;
	updatedAt: Date;
	updatedUser: string;
}