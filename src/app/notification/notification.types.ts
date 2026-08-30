/**
 * Tipos del dominio notifications — espejo de contract.md §10
 *
 * ActividadDTO: { llaveTabla, documento, responsable, ... }
 * Endpoints: GET /notification/getNotifications, POST /notification/readActivity,
 *            POST /notification/transfer, POST /notification/userToTransfer
 */

import { PedidoVentaDTO } from "app/document/model/sw42.domain";
import { BasicDTO, BasicFilterDTO } from "app/shared/shared.domain";

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
  usuarioInactivo: string;
}
