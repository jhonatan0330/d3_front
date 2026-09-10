import { BasicDTO, BasicFilterDTO, BasicParamDTO } from "app/shared/shared.domain";


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
    longitudMaxima?: number;
    valorPorDefecto?: string;
    opciones?: string;
    validacion?: string;
    requerido?: boolean;
    soloLectura?: boolean;
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
    valor:string;
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
    imagen: string;
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
  codigo: string;
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
    tipo: string;
    padre: string;
    nombre: string;
    consecutivo: string;
    imagen: string;
    caracteristicas: DocumentoPlantillaCaracteristicaDTO[];
    estados: ProcesoEstadoDTO[];
    reportes: ReporteBaseDTO[];
    codigo: string;
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
    ordenNombre: string;
    ascendente: string;
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
    rapidaFilter: boolean;
    estadoLLegada: string;
    estadoLlegadaNombre: string;
    estadoLlegadaTipo: string;
    codigo: string;
}

export class PedidoVentaAjusteFilterDTO extends BasicFilterDTO {
    documento: string;
    fechaMin: Date;
    fechaMax: Date;
    estadoInicial: string;
    estadoFinal: string;
    responsable: string;
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
    codigo: string;
    proceso: string;
}

export class WebServiceFilterDTO extends BasicFilterDTO {
    nombre: string;
    codigo: string;
    proceso: string;
}

export class WebServiceEjecucionDTO extends BasicDTO {
    servicio: string;
    usuario: string;
    fecha: Date;
    documento: string;
    modificador: string;
    transaccion: string;
    parametros: string;
    parametersInexecution: string;
    fechaEjecucion: Date;
    entrada: string;
    salida: string;
    error: string;
    masivo: string;
    extracciones: string;
    textoRespuesta: string;
    sincrona: string;
}

export class WebServiceEjecucionFilterDTO extends BasicFilterDTO {
    servicio: string;
    usuario: string;
    fechaMin?: Date;
    fechaMax?: Date;
    documento: string;
    modificador: string;
    transaccion: string;
    fechaEjecucionMin?: Date;
    fechaEjecucionMax?: Date;
    entrada: string;
    salida: string;
    masivo: string;
    textoRespuesta: string;
    sincrona: string;
}

export class MensajePlantillaCorreoDTO extends BasicDTO {
    nombre: string;
    titulo: string;
    texto: string;
    servidor: string;
}

export class MensajePlantillaCorreoFilterDTO extends BasicFilterDTO {
    nombre: string;
    servidor: string;
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
    fechaMin?: Date;
    fechaMax?: Date;
    titulo: string;
    usuario: string;
    documento: string;
    template: string;
    leidoMin?: Date;
    leidoMax?: Date;
    correoEnviadoMin?: Date;
    correoEnviadoMax?: Date;
    adjuntoURL: string;
    reporte: string;
    transaccion: string;
}

export class ProcesoTransicionAutomaticaDTO extends BasicDTO {
    fecha: Date;
    transicion: string;
    plantilla: string;
    plantillaNombre: string;
    propiedad: string;
    ejecucion: string;
    mensaje: string;
}

export class ProcesoTransicionAutomaticaFilterDTO extends BasicFilterDTO {
    fechaMin?: Date;
    fechaMax?: Date;
    transicion: string;
    plantilla: string;
    plantillaNombre: string;
    propiedad: string;
    ejecucionMin?: Date;
    ejecucionMax?: Date;
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
    templates: DocumentoPlantillaDTO[];
    publicToken: string;
}

export class OrganizacionFilterDTO extends BasicFilterDTO {
    nombre: string;
    principal: string;
    servidor: string;
    usuarioSystem: string;
    imagen: string;
    sincronizacionFilter: string;
    codigo: string;
    servidorUrl: string;
    servidorCorreo: string;
}

export class ConsecutivoDTO extends BasicDTO {
    nombre: string;
    prefijo: string;
    sufijo: string;
    numeroInicial: number;
    numeroFinal: number;
    numeroActual: number;
    manual: boolean;
    padding: number;
    consecutivoActual: string;
}

export class ConsecutivoFilterDTO extends BasicFilterDTO {
    nombre: string;
    prefijo: string;
    sufijo: string;
    manualFilter?: boolean;
    padding: number;
    consecutivoActual: string;
}

export class ServidorDTO extends BasicParamDTO {
    tipo: string;
    orden: number;
    nombre: string;
    url: string;
    puerto: string;
    usuario: string;
    clave: string;
    base: string;
    urlConexion: string;
    servidorRespaldo: string;
}

export class ServidorFilterDTO extends BasicFilterDTO {
    tipo: string;
    orden: number;
    nombre: string;
    puerto: string;
    servidorRespaldo: string;
}

export class ProcesoDTO extends BasicParamDTO {
    tipo: string;
    objetivo: string;
    imagen: string;
    prioridad: number;
    macroproceso: string;
    nombre: string;
    codigo: string;
    macroNombre: string;
    hijos: ProcesoDTO[];
    estados: ProcesoEstadoDTO[];
    transiciones?: ProcesoTransicionDTO[];
    plantillas: DocumentoPlantillaDTO[];
}

export class ProcesoFilterDTO extends BasicFilterDTO {
    tipo: string;
    imagen: string;
    prioridad: number;
    macroproceso: string;
    nombre: string;
    codigo: string;
    macroNombre: string;
}

export class TarifaDTO extends BasicDTO {
	tarifario: string;
	tarifarioNombre: string;
	tarifarioDocumento: string;
	producto: string;
	productoDTO: string;
	productoNombre: string;
	valorMinimo: number;
	valor: number;
	valorMaximo: number;
	cantidadMinima: number;
	cantidadMaxima: number;
	totalMinimo: number;
	createdAt: Date;
	createdUser: string;
	updatedAt: Date;
	updatedUser: string;
}

export class DocumentoRelacionGestorDTO extends BasicDTO {
  documentoPrincipal: string;
  documentoModificador: string;
  fecha: Date;
  estadoInicial: string;
  estadoFinal: string;
  usuario: string;
  responsable: string;
  responsableImagen: string;
  modificadorNombre: string;
  comentario: string;
  plantilla: string;
  plantillaNombre: string;
  valores: string;
  transaccion: string;
  cierre: Date;
  nombre: string;
  adjunto: string;
  campos: PedidoVentaCaracteristicaDTO[];
  estados: string[];
}

export class DocumentoRelacionGestorFilterDTO extends BasicFilterDTO {
  documentoPrincipal: string;
  documentoModificador: string;
  fechaMin: Date;
  fechaMax: Date;
  estadoInicial: string;
  estadoFinal: string;
  usuario: string;
  responsable: string;
  responsableImagen: string;
  modificadorNombre: string;
  comentario: string;
  plantilla: string;
  plantillaNombre: string;
  ubicacion: string;
  ubicacionNombre: string;
  ubicacionPlantilla: string;
  valores: string;
  transaccion: string;
  cierreMin: Date;
  cierreMax: Date;
  nombre: string;
  adjunto: string;
}


