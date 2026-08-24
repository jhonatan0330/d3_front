import { BasicDTO, BasicFilterDTO, BasicParamDTO } from "app/shared/shared.domain";
import { TarifaDTO } from "../model/tariff.domain";


export class UsuarioRolProductoDTO extends BasicDTO {
    documento: string;
    documentoNombre: string;
    producto: string;
    productoNombre: string;
    nombre: string;
    modificador: string;
    cantidadPromocion: number;
    cantidadPromocionBase: number;
}
export class ProductoDTO extends BasicParamDTO {
    nombre: string;
    codigo: string;
    filtros: string;
    imagen: string;
    descripcion: string;
    categoria: string;
    categoriaNombre: string;
    usuarioRol: string;
    valorMinimoPromocion: number;
    cantidadPromocion: number;
    cantidadPromocionBase: number;
    detallePlantilla: DetallePedidoVentaDTO;
    documento: string;
    productoBase: string;
    baseNombre: string;
    templateFields: string;
}

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
    productos: ProductoDTO[];
    documentos: PedidoVentaDTO[];
    mostrarSelectorFormato?: boolean;
    editando?: boolean;
    _editValue?: string;
}

export class propiedadCampo extends BasicDTO {
    cambioCreacion : string;
    campo : string;
    fechaDefinicion:Date;
    fechaImplementacion:Date;
    key:string;
    motivo:string;
    nombre:string;
    propiedadValor:string;
    tipo:string;
    valor:number;
    texto?: string;
}

export class PropiedadCampoDTO extends propiedadCampo {
    texto: string;
    bloqueo: string;
    fechaFinal: string;
    fechaInicial: string;
    rol: string;
    rolNombre: string;
    rolExcluyente: string;
    rolExcluyenteNombre: string;
    usuario: string;
    usuarioNombre: string;
    usuarioExcluyente: string;
    usuarioExcluyenteNombre: string;
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
    transaccion: string;
    dinero: PedidoVentaDineroDTO;
    caracteristicas: PedidoVentaCaracteristicaDTO[];
    campoOrigen: string;
    campoPropiedad: string;
    server: string;
    messages: DocumentMessage[];
    historico: number;
}

export class DocumentMessage {
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
    //transaccionRegistro: string;
    //transaccionInactivo: string;
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
  documentToTransition: PedidoVentaDTO;
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
    fechaInicio?: string;
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
    valorMaximo: number;
    plantilla: string;
    valorSubtotal: number;
    tarifas: TarifaDTO[];
    transaccionRegistro: string;
    transaccionInactivo: string;
    campo: string;
    plantillaDetalle: string;
    documentoDetalle: PedidoVentaDTO;
    detalleId: string;
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
    dependientes: PedidoVentaCaracteristicaDTO[];
    expedientes: PedidoVentaDTO[];
    mensaje: string;
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

export class WebServiceDTO extends BasicParamDTO {
    nombre: string;
    url: string;
    metodo: string;
    cabeceras: string;
    parametros: string;
    autenticacion: string;
    usuario: string;
    clave: string;
    timeout: number;
    reintentos: number;
}

export class WebServiceFilterDTO extends BasicFilterDTO {
    nombre: string;
    url: string;
    metodo: string;
}

export class WebServiceEjecucionDTO extends BasicDTO {
    webService: string;
    webServiceNombre: string;
    parametrosEntrada: string;
    resultado: string;
    estado: string;
    error: string;
    fechaEjecucion: Date;
    duracion: number;
}

export class WebServiceEjecucionFilterDTO extends BasicFilterDTO {
    webService: string;
    estado: string;
    fechaDesde: Date;
    fechaHasta: Date;
}

export class MensajePlantillaCorreoDTO extends BasicParamDTO {
    nombre: string;
    asunto: string;
    cuerpo: string;
    tipo: string;
    adjuntos: string;
}

export class MensajePlantillaCorreoFilterDTO extends BasicFilterDTO {
    nombre: string;
    tipo: string;
}

export class MensajeDTO extends BasicDTO {
    fecha: Date;
    titulo: string;
    usuario: string;
    documento: string;
    template: string;
    parametros: string;
    leido: Date;
    correoEnviado: Date;
    correoError: string;
    correo: string;
    reporte: string;
    adjuntoURL: string;
    transaccion: string;
}

export class MensajeFilterDTO extends BasicFilterDTO {
    fechaDesde: Date;
    fechaHasta: Date;
    enviado: string;
    usuario: string;
    titulo: string;
}

export class ProcesoTransicionAutomaticaDTO extends BasicParamDTO {
    proceso: string;
    procesoNombre: string;
    estadoOrigen: string;
    estadoOrigenNombre: string;
    estadoDestino: string;
    estadoDestinoNombre: string;
    condicion: string;
    programa: string;
    fechaProgramada: Date;
    activa: boolean;
}

export class ProcesoTransicionAutomaticaFilterDTO extends BasicFilterDTO {
    proceso: string;
    estadoOrigen: string;
    estadoDestino: string;
    activa: boolean;
    fechaDesde: Date;
    fechaHasta: Date;
}

export class OrganizacionDTO extends BasicParamDTO {
    nombre: string;
    codigo: string;
    nit: string;
    direccion: string;
    telefono: string;
    email: string;
    logo: string;
    principal: boolean;
}

export class OrganizacionFilterDTO extends BasicFilterDTO {
    nombre: string;
    codigo: string;
    nit: string;
    principal: boolean;
}

export class ConsecutivoDTO extends BasicDTO {
    nombre: string;
    prefijo: string;
    consecutivo: number;
    longitud: number;
    reinicioAnual: boolean;
    reinicioMensual: boolean;
    formato: string;
}

export class ConsecutivoFilterDTO extends BasicFilterDTO {
    nombre: string;
    prefijo: string;
}

export class ServidorDTO extends BasicParamDTO {
    nombre: string;
    url: string;
    tipo: string;
    usuario: string;
    clave: string;
    baseDatos: string;
    puerto: number;
    activo: boolean;
}

export class ServidorFilterDTO extends BasicFilterDTO {
    nombre: string;
    tipo: string;
    activo: boolean;
}

export class ProcesoDTO extends BasicParamDTO {
    nombre: string;
    codigo: string;
    descripcion: string;
    imagen: string;
    color: string;
    consecutivo: string;
    objetivo: string;
}

export class ProcesoFilterDTO extends BasicFilterDTO {
    nombre: string;
    codigo: string;
    objetivo: string;
}


