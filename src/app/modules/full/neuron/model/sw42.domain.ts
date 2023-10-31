import { CategoriaProductoDTO, ProductoDTO, TarifaDTO, UsuarioRolProductoDTO } from "app/inventory/inventory.types";
import { BasicDTO, BasicParamDTO } from "app/shared/shared.domain";

export class ProcesoEstadoDTO extends BasicParamDTO {
  tipo: string;
  estadoDocumento: string;
  avance: number;
  nombre: string;
  proceso: string;
  procesoNombre: string;
  transiciones: ProcesoTransicionDTO[];
}

export class DocumentoPlantillaCaracteristicaDTO extends BasicParamDTO {
  objetivo: string;
  plantilla: string;
  plantillaNombre: string;
  formato: string;
  nombre: string;
  codigo: string;
  orden: number;
  imagen: string;
  categorias: CategoriaProductoDTO[];
  productos: ProductoDTO[];
  documentos: PedidoVentaDTO[];
}
export class PedidoVentaDTO extends BasicDTO {
  fechaRegistro: Date;
  fecha: Date;
  funcionario: string;
  funcionarioNombre: string;
  plantilla: string;
  consecutivo: number;
  nombre: string;
  imagen: string;
  descripcion: string;
  estadoExpediente: string;
  textoFiltro: string;
  estadoNombre: string;
  historico: number;
  transaccion: string;
  dinero: PedidoVentaDineroDTO;
  caracteristicas: PedidoVentaCaracteristicaDTO[];
  campoOrigen: string;
  campoPropiedad: string;
  server: string;
}
export class PedidoVentaCaracteristicaDTO extends BasicDTO {
  documento: string;
  campo: string;
  campoDTO: DocumentoPlantillaCaracteristicaDTO;
  valorText: string;
  valorFecha: Date;
  valorOpcion: string;
  valorAuxiliar: string;
  valorNumero: number;
  principal: PedidoVentaDTO;
  detalles: DetallePedidoVentaDTO[];
  productosExclusivos: UsuarioRolProductoDTO[];
  dependientes: PedidoVentaCaracteristicaDTO[];
  expedientes: PedidoVentaDTO[];
  modificado: boolean;
  transaccionRegistro: string;
  transaccionInactivo: string;
}
export class ProcesoTransicionDTO extends BasicParamDTO {
  procesoNombre: string;
  estadoPartidaOrden: number;
  estadoLlegadaOrden: number;
  nombre: string;
  proceso: string;
  estadoPartida: string;
  estadoPartidaNombre: string;
  plantilla: string;
  plantillaNombre: string;
  documentador: boolean;
  afectaSaldo: string;
  imagen: string;
  rapida: boolean;
  estadoLLegada: string;
  estadoLlegadaNombre: string;
  estadoLlegadaTipo: string;
}
export class PedidoVentaAjusteDTO extends BasicDTO {
  documento: string;
  fecha: Date;
  estadoInicial: string;
  estadoFinal: string;
  motivo: string;
  responsable: string;
}
export class DocumentoPlantillaDTO extends BasicParamDTO {
  objetivo: string;
  nombre: string;
  consecutivo: string;
  imagen: string;
  caracteristicas: DocumentoPlantillaCaracteristicaDTO[];
  estados: ProcesoEstadoDTO[];
  color: string;
  documentos: PedidoVentaDTO[];
  reportes: ReporteBaseDTO[];
  codigo: string;
  server: string;
  proceso: string;
}

export class PedidoVentaDineroDTO extends BasicDTO {
  documento: string;
  fecha: Date;
  valorTotal: number;
  saldo: number;
  valorCampo: number;
}


export class RelacionInternaDTO extends BasicDTO {
  propiedad: string;
  propiedadNombre: string;
  plantilla: string;
  plantillaNombre: string;
  campo: string;
  campoNombre: string;
  auxiliar: string;
}
export class UsuarioRolDTO extends BasicDTO {
  usuario: string;
  usuarioIdentificacion: string;
  usuarioNombre: string;
  usuarioImagen: string;
  rolAcceso: string;
  rolNombre: string;
  documento: string;
  fechaInicial: Date;
  fechaFinal: Date;
}
export class RolAccesoDTO extends BasicParamDTO {
  plantilla: string;
  nombre: string;
  codigo: string;
  imagen: string;
  permisosCompletos: boolean;
  minutosSesion: number;
}
export class UsuarioDTO extends BasicDTO {
  identificacion: string;
  nombre: string;
  imagen: string;
  rol: string;
  documento: string;
  productos: ProductoDTO[];
  usuarioFiltroDependiente: string;
  correo: string;
  usuarioRol: string;
  telefono: string;
}
export class PostRespuestaDTO extends BasicDTO {
  calificacionesPositivas: number;
  calificacionesNegativas: number;
  fecha: Date;
  autor: string;
  autorNombre: string;
  autorImagen: string;
  pregunta: string;
  respuesta: string;
}

export class PostCalificacionDTO extends BasicDTO {
  usuario: string;
  fecha: Date;
  respuesta: string;
  positiva: boolean;
}
export class PostPreguntaDTO extends BasicDTO {
  campo: string;
  tipo: string;
  calificaciones: number;
  fecha: Date;
  autor: string;
  autorImagen: string;
  autorNombre: string;
  pregunta: string;
  respuestas: PostRespuestaDTO[];
}
export class DetallePedidoVentaDTO extends BasicParamDTO {
  documento: string;
  producto: string;
  productoTercero: string;
  productoCodigo: string;
  productoImagen: string;
  productoDocumento: string;
  nombre: string;
  cantidad: number;
  cantidadPromocion: number;
  cantidadPromocionBase: number;
  cantidadTotal: number;
  valorMinimo: number;
  valorTotal: number;
  valorUnitario: number;
  caracteristicas: PedidoVentaCaracteristicaDTO[];
  valorMaximo: number;
  plantilla: string;
  valorSubtotal: number;
  tarifas: TarifaDTO[];
  transaccionRegistro: string;
  transaccionInactivo: string;
  campo: string;
}

export class ModuloDTO extends BasicDTO {
  nombre: string;
  descripcion: string;
  imagen: string;
  url: string;
}
export class ReporteBaseDTO extends BasicParamDTO {
  plantilla: string;
  plantillaNombre: string;
  nombre: string;
  codigo: string;
  soloExistente: boolean;
  variables: string;
  version: number;
  descripcion: string;
  servidor: string;
  multiplesId: string;
  servidorUrl: string;
  publico: boolean;
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
export class OrganizacionDTO extends BasicParamDTO {
  nombre: string;
  principal: string;
  servidor: string;
  usuarioSystem: string;
  imagen: string;
  slogan: string;
  sincronizacion: boolean;
  mensajeIngreso: string;
  codigo: string;
  servidorUrl: string;
  servidorCorreo: string;
  plantillas: DocumentoPlantillaDTO[];
  menuPlantillas: DocumentoPlantillaDTO[];
  reportePlantillas: DocumentoPlantillaDTO[];
  token: string;
}
export class IndicadorDTO extends BasicDTO {
  nombre: string;
  codigo: string;
  valorDia: number;
  valorMes: number;
  valorYear: number;
}

export class ProductoInventarioDTO extends BasicDTO {
  producto: string;
  nombre: string;
  codigo: string;
  bodega: string;
  nombreBodega: string;
  cantidadActual: number;
  cantidadMinima: number;
  cantidadMaxima: number;
}