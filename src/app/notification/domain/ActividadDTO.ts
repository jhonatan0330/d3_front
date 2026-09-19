import { PedidoVentaDTO } from 'app/document/document.types';
import { BasicDTO } from 'app/shared/shared.domain';

export class ActividadDTO extends BasicDTO {
  responsable: string;
  responsableIdentificacion: string;
  responsableNombre: string;
  documento: string;
  documentoDTO: PedidoVentaDTO;
  responsableFoto: string;
  comentario: string;
  fechaArrancar: Date;
  fechaRegistro: Date;
  usuarioRegistro: string;
  fechaInactivo: Date;
  fechaTerminar: Date;
  usuarioInactivo: string;
  fechaLeido: Date;
}