import { DocumentMessage, PedidoVentaDTO } from "app/document/model/sw42.domain";

export class LoadLineDTO {
	orderNumber: number;
	document: PedidoVentaDTO;
	messages: DocumentMessage[];
	status : string = 'OK';
	documentName: string;
	documentId: string;
	updateId: string;
}

