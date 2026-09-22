import { BasicDTO } from 'app/shared/shared.domain';

export class UsuarioOrganizacionDTO extends BasicDTO {
  usuario: string;
  organizacion: string;
  tokenServer: string;
  usuarioNombre: string;
}
