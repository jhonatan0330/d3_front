
import { ModuloDTO } from "app/authorization/authorization.domain";
import { DocumentoPlantillaDTO } from "app/modules/full/neuron/model/sw42.domain";
import { BasicDTO, BasicFilterDTO, BasicParamDTO } from "app/shared/shared.domain";

export class UsuarioDTO extends BasicDTO {
  identificacion: string;
  nombre: string;
  imagen: string;
  rol: string;
  documento: string;
  //productos: ProductoDTO[];
  usuarioFiltroDependiente: string;
  correo: string;
  usuarioRol: string;
  telefono: string;
}

export class OrganizacionDTO extends BasicParamDTO {
  nombre: string;
  principal: string;
  servidor: string;
  usuarioSystem: string;
  imagen: string;
  slogan: string;
  mensajeIngreso: string;
  codigo: string;
  plantillas: DocumentoPlantillaDTO[];
  menuPlantillas: DocumentoPlantillaDTO[];
  reportePlantillas: DocumentoPlantillaDTO[];
  token: string;
}

export class UsuarioOrganizacionDTO extends BasicDTO {
  usuario: string;
  organizacion: string;
  tokenServer: string;
  usuarioNombre: string;
}

export class UsuarioAutenticacionDTO extends BasicDTO {
  usuario: string;
  sesion: string;
  clave: string;
  usuarioNombre: string;
  claveAnterior: string;
  tableroControl: number;
  usuarioDTO: UsuarioDTO;
  organizacion: OrganizacionDTO;
  mensaje: string;
  token: string;
  modulos: ModuloDTO[];
  fechaCreacion: Date;
}

/*
export class UsuarioOrganizacionFilterDTO extends BasicFilterDTO {
  usuario: string;
  organizacion: string;
  tokenServer: string;
  usuarioNombre: string;
}*/
			
export class UsuarioAutenticacionFilterDTO extends BasicFilterDTO {
  usuario: string;
  sesion: string;
  clave: string;
  usuarioNombre: string;
  claveAnterior: string;
  tableroControl: number;
  mensaje: string;
  token: string;
  fechaMaximaMin: Date;
  fechaMaximaMax: Date;
  ip: string;
  autorizacionCrea: string;
  autorizacionElimina: string;
}
/*			
export class OrganizacionFilterDTO extends BasicFilterDTO {
  nombre: string;
  principal: string;
  servidor: string;
  usuarioSystem: string;
  imagen: string;
  sincronizacionFilter: boolean;
  codigo: string;
  servidorUrl: string;
  servidorCorreo: string;
}

export class UsuarioRolFilterDTO extends BasicFilterDTO {
  usuario: string;
  usuarioIdentificacion: string;
  usuarioNombre: string;
  usuarioImagen: string;
  rolAcceso: string;
  rolNombre: string;
  documento: string;
  fechaInicialMin: Date;
  fechaInicialMax: Date;
  fechaFinalMin: Date;
  fechaFinalMax: Date;
}
			
export class RolAccesoFilterDTO extends BasicFilterDTO {
  plantilla: string;
  nombre: string;
  codigo: string;
  imagen: string;
  permisosCompletosFilter: boolean;
  minutosSesion: number;
}
			
export class UsuarioFilterDTO extends BasicFilterDTO {
  identificacion: string;
  nombre: string;
  imagen: string;
  rol: string;
  documento: string;
  usuarioFiltroDependiente: string;
  usuarioRol: string;
  telefono: string;
}
*/			

			

