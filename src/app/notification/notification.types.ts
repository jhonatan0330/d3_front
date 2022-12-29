import { PedidoVentaDTO } from "app/modules/full/neuron/model/sw42.domain";
import { BasicDTO } from "app/shared/domain/sw42.domain";

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
    fechaLimite: Date;
    usuarioInactivo: string;
    duracion: number;
    actividadPrevia: string;
    actividadSiguiente: string;
    fechaLeido: Date;
  }
