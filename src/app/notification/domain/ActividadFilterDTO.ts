import { BasicFilterDTO } from 'app/shared/shared.domain';

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