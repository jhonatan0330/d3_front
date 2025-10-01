
import { DocumentoPlantillaDTO } from "app/modules/full/neuron/model/sw42.domain";
import { BasicDTO, BasicFilterDTO, BasicParamDTO } from "app/shared/shared.domain";

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
}

export class RolAccesoFilterDTO extends BasicFilterDTO {
  id:string;
  plantilla: string;
  nombre: string;
  codigo: string;
  imagen: string;
}

export class PermisosDTO extends BasicFilterDTO {
  id:string;
  estado: string;
  propiedadValor: string;
  tipo: string;
  nombre: string;
  key:string;
  campo: string;
  valor:string;
  texto: string;
  motivo: string;
  rol:string;
  rolNombre: string;
  fechaInicial: string;
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
  templates: DocumentoPlantillaDTO[];
  publicToken: string;
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
  usuarioDTO: UsuarioDTO;
  organizacion: OrganizacionDTO;
  mensaje: string;
  token: string;
  fechaCreacion: Date;
}

			
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

