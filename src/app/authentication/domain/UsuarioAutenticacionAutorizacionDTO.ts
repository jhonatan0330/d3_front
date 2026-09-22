import { BasicDTO } from 'app/shared/shared.domain';

export class UsuarioAutenticacionAutorizacionDTO extends BasicDTO {
  usuario: string;
  correo: string;
}
