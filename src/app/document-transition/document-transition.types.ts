import { PedidoVentaCaracteristicaDTO } from "app/modules/full/neuron/model/sw42.domain";
import { BasicDTO, BasicFilterDTO } from "app/shared/shared.domain";

export class DocumentoRelacionGestorDTO extends BasicDTO {
  documentoPrincipal: string;
  documentoModificador: string;
  fecha: Date;
  estadoInicial: string;
  estadoFinal: string;
  usuario: string;
  responsable: string;
  responsableImagen: string;
  modificadorNombre: string;
  comentario: string;
  plantilla: string;
  plantillaNombre: string;
  ubicacion: string;
  ubicacionNombre: string;
  ubicacionPlantilla: string;
  valores: string;
  saldo: number;
  total: number;
  transaccion: string;
  cierre: Date;
  nombre: string;
  adjunto: string;
  campos: PedidoVentaCaracteristicaDTO[];
}

export class DocumentoRelacionGestorFilterDTO extends BasicFilterDTO {
  documentoPrincipal: string;
  documentoModificador: string;
  fechaMin: Date;
  fechaMax: Date;
  estadoInicial: string;
  estadoFinal: string;
  usuario: string;
  responsable: string;
  responsableImagen: string;
  modificadorNombre: string;
  comentario: string;
  plantilla: string;
  plantillaNombre: string;
  ubicacion: string;
  ubicacionNombre: string;
  ubicacionPlantilla: string;
  valores: string;
  transaccion: string;
  cierreMin: Date;
  cierreMax: Date;
  nombre: string;
  adjunto: string;
}
