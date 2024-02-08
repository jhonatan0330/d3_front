import { CategoriaProductoDTO, ProductoDTO, UsuarioRolProductoDTO } from "app/inventory/inventory.types";
import { BasicDTO, BasicFilterDTO, BasicParamDTO } from "app/shared/shared.domain";
import { TarifaDTO } from "app/tariff/tariff.domain";

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
  messages: DocumentMessage[];
}

export class DocumentMessage  {
  message: string;
	type: string;
	date: Date;
	documentCode: string;
	documentId: string;
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
  filtersByFields: PedidoVentaCaracteristicaFilterDTO[];
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
				
export class RelacionInternaFilterDTO extends BasicFilterDTO {
  propiedad: string;
  propiedadNombre: string;
  plantilla: string;
  plantillaNombre: string;
  campo: string;
  campoNombre: string;
  auxiliar: string;
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