import {
  DetallePedidoVentaDTO,
  DocumentoPlantillaCaracteristicaDTO,
  PedidoVentaCaracteristicaDTO,
  PedidoVentaDTO,
} from './sw42.domain';

export class BasicFilterDTO {
  paginacionRegistroInicial: number;
  paginacionRegistroFinal: number;
  filtroParametro: string;
  llaveTabla: string;
  estado: string;
  securityToken: string;
}

			
export class ProcesoEstadoFilterDTO extends BasicFilterDTO {
  tipo: string;
  estadoDocumento: string;
  avance: number;
  nombre: string;
  proceso: string;
  procesoNombre: string;
}
			
			
export class DocumentoPlantillaCaracteristicaFilterDTO extends BasicFilterDTO {
  plantilla: string;
  plantillaNombre: string;
  formato: string;
  nombre: string;
  codigo: string;
  orden: number;
  imagen: string;
  documentos: PedidoVentaDTO[];
}
			
export class PedidoVentaFilterDTO extends BasicFilterDTO {
  fechaRegistroMin: Date;
  fechaRegistroMax: Date;
  fechaMin: Date;
  fechaMax: Date;
  funcionario: string;
  funcionarioNombre: string;
  proceso: string;
  plantilla: string;
  nombre: string;
  imagen: string;
  descripcion: string;
  estadoExpediente: string;
  textoFiltro: string;
  estadoNombre: string;
  historico: number;
  transaccion: string;
  caracteristicas: PedidoVentaCaracteristicaDTO[];
  campoOrigen: string;
  campoPropiedad: string;
}
			
export class PedidoVentaCaracteristicaFilterDTO extends BasicFilterDTO {
  documento: string;
  campo: string;
  campoDTO: DocumentoPlantillaCaracteristicaDTO;
  valorText: string;
  valorFechaMin: Date;
  valorFechaMax: Date;
  valorOpcion: string;
  valorAuxiliar: string;
  valorNumeroMin: number;
  valorNumeroMax: number;
  detalles: DetallePedidoVentaDTO[];
  dependientes: PedidoVentaCaracteristicaDTO[];
  expedientes: PedidoVentaDTO[];
  transaccionRegistro: string;
  transaccionInactivo: string;
}
			
export class ProcesoTransicionFilterDTO extends BasicFilterDTO {
  procesoNombre: string;
  estadoPartidaOrden: number;
  estadoLlegadaOrden: number;
  nombre: string;
  proceso: string;
  estadoPartida: string;
  estadoPartidaNombre: string;
  plantilla: string;
  plantillaNombre: string;
  documentadorFilter: boolean;
  afectaSaldo: string;
  imagen: string;
  rapidaFilter: boolean;
  estadoLLegada: string;
  estadoLlegadaNombre: string;
  estadoLlegadaTipo: string;
}
			
export class PedidoVentaAjusteFilterDTO extends BasicFilterDTO {
  documento: string;
  fechaMin: Date;
  fechaMax: Date;
  estadoInicial: string;
  estadoFinal: string;
  responsable: string;
}
			
export class DocumentoPlantillaFilterDTO extends BasicFilterDTO {
  nombre: string;
  consecutivo: string;
  imagen: string;
  color: string;
  codigo: string;
  server: string;
  proceso: string;
}
			
export class TarifaFilterDTO extends BasicFilterDTO {
  tarifario: string;
  tarifarioNombre: string;
  producto: string;
  productoNombre: string;
  recurso: string;
  recursoNombre: string;
  rangoPreciosFilter: boolean;
  cantidadMinima: number;
  cantidadMaxima: number;
  dimension2: string;
  dimension2Nombre: string;
  dimension3: string;
  dimension3Nombre: string;
  dimension4: string;
  dimension4Nombre: string;
}
			
export class PedidoVentaDineroFilterDTO extends BasicFilterDTO {
  documento: string;
  fechaMin: Date;
  fechaMax: Date;
}
			
			
export class PropiedadFilterDTO extends BasicFilterDTO {
  propiedadValor: string;
  tipo: string;
  nombre: string;
  key: string;
  campo: string;
  texto: string;
  fechaDefinicionMin: Date;
  fechaDefinicionMax: Date;
  fechaImplementacionMin: Date;
  fechaImplementacionMax: Date;
  cambioCreacion: string;
  cambioEliminacion: string;
  rol: string;
  rolNombre: string;
  rolExcluyente: string;
  rolExcluyenteNombre: string;
  fechaInicialMin: Date;
  fechaInicialMax: Date;
  fechaFinalMin: Date;
  fechaFinalMax: Date;
  usuario: string;
  usuarioNombre: string;
  usuarioExcluyente: string;
  usuarioExcluyenteNombre: string;
  bloqueo: string;
}
			
export class RelacionInternaFilterDTO extends BasicFilterDTO {
  propiedad: string;
  propiedadNombre: string;
  plantilla: string;
  plantillaNombre: string;
  campo: string;
  campoNombre: string;
  auxiliar: string;
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
			
export class PostRespuestaFilterDTO extends BasicFilterDTO {
  calificacionesPositivas: number;
  calificacionesNegativas: number;
  fechaMin: Date;
  fechaMax: Date;
  autor: string;
  autorNombre: string;
  autorImagen: string;
  pregunta: string;
}
			
export class GPSLocalizacionFilterDTO extends BasicFilterDTO {
  dispositivo: string;
  fechaMin: Date;
  fechaMax: Date;
  documento: string;
}
			
export class PostCalificacionFilterDTO extends BasicFilterDTO {
  usuario: string;
  fechaMin: Date;
  fechaMax: Date;
  respuesta: string;
  positivaFilter: boolean;
}
			
export class PostPreguntaFilterDTO extends BasicFilterDTO {
  campo: string;
  tipo: string;
  calificaciones: number;
  fechaMin: Date;
  fechaMax: Date;
  autor: string;
  autorImagen: string;
  autorNombre: string;
}
			
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
			
export class DetallePedidoVentaFilterDTO extends BasicFilterDTO {
  documento: string;
  producto: string;
  productoTercero: string;
  productoCodigo: string;
  productoImagen: string;
  productoDocumento: string;
  nombre: string;
  cantidadPromocion: number;
  cantidadPromocionBase: number;
  plantilla: string;
  transaccionRegistro: string;
  transaccionInactivo: string;
}
			
export class CategoriaProductoFilterDTO extends BasicFilterDTO {
  nombre: string;
  imagen: string;
  nodoSuperior: string;
  inventariosFilter: boolean;
  camposAdicionalesFilter: boolean;
  composicionFilter: boolean;
  promocionBase: number;
}
			
export class ProductoInventarioFilterDTO extends BasicFilterDTO {
  producto: string;
  nombre: string;
  codigo: string;
  bodega: string;
  nombreBodega: string;
  fechaInicialMin: Date;
  fechaInicialMax: Date;
}
			
export class ProductoCaracteristicaFilterDTO extends BasicFilterDTO {
  base: string;
  baseNombre: string;
  formato: string;
  nombre: string;
  codigo: string;
  orden: number;
  imagen: string;
}
			
export class UsuarioRolProductoFilterDTO extends BasicFilterDTO {
  documento: string;
  documentoNombre: string;
  producto: string;
  productoNombre: string;
  nombre: string;
  modificador: string;
  cantidadPromocion: number;
  cantidadPromocionBase: number;
}
			
export class ProductoFilterDTO extends BasicFilterDTO {
  nombre: string;
  codigo: string;
  filtros: string;
  imagen: string;
  categoria: string;
  categoriaNombre: string;
  usuarioRol: string;
  cantidadPromocion: number;
  cantidadPromocionBase: number;
  documento: string;
  productoBase: string;
  baseNombre: string;
}
			
export class ModuloContratadoFilterDTO extends BasicFilterDTO {
  modulo: string;
  nombre: string;
  imagen: string;
  moduloUrl: string;
  moduloLlave: string;
}
			
export class ReporteBaseFilterDTO extends BasicFilterDTO {
  plantilla: string;
  plantillaNombre: string;
  nombre: string;
  codigo: string;
  soloExistenteFilter: boolean;
  version: number;
  servidor: string;
  multiplesId: string;
  servidorUrl: string;
  publicoFilter: boolean;
}
			
export class UsuarioOrganizacionFilterDTO extends BasicFilterDTO {
  usuario: string;
  organizacion: string;
  tokenServer: string;
  usuarioNombre: string;
}
			
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
