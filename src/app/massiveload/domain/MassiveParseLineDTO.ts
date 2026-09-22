import { DocumentMessage, PedidoVentaDTO } from 'app/document/document.types';

export interface MassiveParseLineDTO {
  orderNumber: number;
  updateId: string;
  status: string;
  messages: DocumentMessage[];
  document: PedidoVentaDTO;
}
