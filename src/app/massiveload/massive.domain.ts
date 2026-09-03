import { DocumentMessage, PedidoVentaDTO } from "app/document/document.types";

export class LoadLineDTO {
	orderNumber: number;
	document: PedidoVentaDTO;
	messages: DocumentMessage[];
	status : string = 'OK';
	documentName: string;
	documentId: string;
	updateId: string;
}

