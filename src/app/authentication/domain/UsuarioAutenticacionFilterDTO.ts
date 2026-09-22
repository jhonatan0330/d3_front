import { BasicFilterDTO } from 'app/shared/shared.domain';

export class UsuarioAutenticacionFilterDTO extends BasicFilterDTO {
  usuario: string;
  sesion: string;
  clave: string;
  usuarioNombre: string;
  claveAnterior: string;
  mensaje: string;
  token: string;
  fechaMaximaMin: Date;
  fechaMaximaMax: Date;
  ip: string;
  autorizacionCrea: string;
  autorizacionElimina: string;
}
