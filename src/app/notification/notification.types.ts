import { PedidoVentaDTO } from "app/modules/full/neuron/model/sw42.domain";
import { BasicFilterDTO } from "app/modules/full/neuron/model/sw42.filter";
import { BasicDTO } from "app/shared/shared.domain";

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

export class ActividadFilterDTO extends BasicFilterDTO {
  responsable: string;
  responsableIdentificacion: string;
  responsableNombre: string;
  documento: string;
  responsableFoto: string;
  fechaArrancarMin: Date;
  fechaArrancarMax: Date;
  fechaRegistroMin: Date;
  fechaRegistroMax: Date;
  usuarioRegistro: string;
  fechaInactivoMin: Date;
  fechaInactivoMax: Date;
  fechaTerminarMin: Date;
  fechaTerminarMax: Date;
  fechaLimiteMin: Date;
  fechaLimiteMax: Date;
  usuarioInactivo: string;
  duracion: number;
  actividadPrevia: string;
  actividadSiguiente: string;
  fechaLeidoMin: Date;
  fechaLeidoMax: Date;
}
