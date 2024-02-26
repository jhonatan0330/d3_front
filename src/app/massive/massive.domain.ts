import { DocumentMessage, PedidoVentaDTO } from "app/modules/full/neuron/model/sw42.domain";

export class LoadLineDTO {
	orderNumber: number;
	document: PedidoVentaDTO;
	messages: DocumentMessage[];
	status : string = 'OK';
	documentName: string;
	documentId: string;
}

