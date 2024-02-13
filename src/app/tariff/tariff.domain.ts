import { BasicDTO } from "app/shared/shared.domain";

export class TarifaDTO extends BasicDTO {
	tarifario: string;
	tarifarioNombre: string;
	documento: string;
	producto: string;
	productoDTO: string;
	productoNombre: string;
	recurso: string;
	recursoDTO: string;
	recursoNombre: string;
	rangoPrecios: boolean;
	valorMinimo: number;
	valor: number;
	valorMaximo: number;
	cantidadMinima: number;
	cantidadMaxima: number;
	totalMinimo: number;
	dimension2: string;
	dimension2DTO: string;
	dimension2Nombre;
	dimension3: string;
	dimension3DTO: string;
	dimension3Nombre: string;
	dimension4: string;
	dimension4DTO: string;
	dimension4Nombre: string;
	createdAt: Date;
	createdUser: string;
	updatedAt: Date;
	updatedUser: string;
}

export class TariffOptionDTO {
	key: string;
	code: string;
	name: string;
	productId: string;
	template: string;
}