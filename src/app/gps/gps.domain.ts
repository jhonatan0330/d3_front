import { BasicDTO } from "app/shared/domain/sw42.domain";

export class GPSLocalizacionDTO extends BasicDTO {
  dispositivo: string;
  fecha: Date;
  longitud: number;
  latitud: number;
  documento: string;
}

export class GPSDispositivoDTO extends BasicDTO {
  usuario: string;
  nombre: string;
  ultimaConexion: Date;
  intervalo: number;
  distancia: number;
  acercamiento: number;
  usuarioNombre: string;
}
