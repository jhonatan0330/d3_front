import { BasicDTO } from 'app/shared/shared.domain';

export class UsuarioDTO extends BasicDTO {
  identificacion: string;
  nombre: string;
  imagen: string;
  rol: string;
  documento: string;
  usuarioFiltroDependiente: string;
  correo: string;
  usuarioRol: string;
  telefono: string;
  codigo?: string;
}
