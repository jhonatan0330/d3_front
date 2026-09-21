import { DocumentMessage, PedidoVentaDTO } from 'app/document/document.types';

export interface PlantillaBaseRequest {
	templateId: string;
	format: string;
}

export interface PlantillaBaseResponse {
	url: string;
}

export interface MassiveParseLineDTO {
	orderNumber: number;
	updateId: string;
	status: string;
	messages: DocumentMessage[];
	document: PedidoVentaDTO;
}

export interface MassiveParseResponse {
	lines: MassiveParseLineDTO[];
	camposSinValidar: string[];
}