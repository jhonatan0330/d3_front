import { BasicDTO } from 'app/shared/shared.domain';

export class UsuarioAutenticacionDTO extends BasicDTO {
  usuario: string;
  sesion: string;
  clave: string;
  usuarioNombre: string;
  claveAnterior: string;
  mensaje: string;
  token: string;
  fechaCreacion: Date;
  fechaMaxima: Date;
}
