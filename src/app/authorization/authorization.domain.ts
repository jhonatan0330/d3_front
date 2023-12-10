import { BasicDTO, BasicParamDTO } from "app/shared/shared.domain";

export class ModuloDTO extends BasicDTO {
  nombre: string;
  descripcion: string;
  imagen: string;
  moduloUrl: string;
}

export class RolAccesoDTO extends BasicParamDTO {
  plantilla: string;
  nombre: string;
  codigo: string;
  imagen: string;
  permisosCompletos: boolean;
  minutosSesion: number;
}

/*export class UsuarioRolDTO extends BasicDTO {
  usuario: string;
  usuarioIdentificacion: string;
  usuarioNombre: string;
  usuarioImagen: string;
  rolAcceso: string;
  rolNombre: string;
  documento: string;
  fechaInicial: Date;
  fechaFinal: Date;
}*/

