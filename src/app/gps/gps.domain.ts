import { BasicDTO, BasicFilterDTO } from "app/shared/shared.domain";

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

export class GPSLocalizacionFilterDTO extends BasicFilterDTO {
  dispositivo: string;
  fechaMin: Date;
  fechaMax: Date;
  documento: string;
}

/*
export class GPSDispositivoFilterDTO extends BasicFilterDTO {
  usuario: string;
  nombre: string;
  ultimaConexionMin: Date;
  ultimaConexionMax: Date;
  intervalo: number;
  distancia: number;
  acercamiento: number;
  usuarioNombre: string;
}


*/