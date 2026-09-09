export enum DocumentoPlantillaCaracteristicaEnum {
  TEXTO = 'T',
  FECHA = 'F',
  PROCESO = 'Z',
  NUMERO = 'N',
  BINARIO = 'I',
  PRODUCTO = 'J',
  ARCHIVO = 'A',
  CROQUIS = 'B',
  CONFIGURACION = 'G',
  DISPONIBILIDAD = 'U',
  PRODUCTO_LISTA = 'Q',
  SECCION = 'S',
  GPS = 'P',
  GPS_MAP = 'M',
  INFORMATIVE = 'V',
  VINCULO = 'C'
}

export enum StatesEnum {
  ACTIVE = 'A',
  INACTIVE = 'I',
  FINALIZADO = 'C'
}

export enum DocumentoPlantillaTipoEnum {
  PRINCIPAL = 'P',
  ACTIVACION = 'A',
  ANULACION = 'I',
  MODIFICACIONES = 'U',
  REPORTE = 'T',
  ROL = 'R'
}

export const DocumentoPlantillaTipoLabel: Record<string, string> = {
  [DocumentoPlantillaTipoEnum.PRINCIPAL]: 'P - Principal de proceso',
  [DocumentoPlantillaTipoEnum.ACTIVACION]: 'A - Activación',
  [DocumentoPlantillaTipoEnum.ANULACION]: 'I - Anulación',
  [DocumentoPlantillaTipoEnum.MODIFICACIONES]: 'U - Modificaciones',
  [DocumentoPlantillaTipoEnum.REPORTE]: 'T - Reporte',
  [DocumentoPlantillaTipoEnum.ROL]: 'R - Rol'
};


export enum PropiedadEnum {
  ORGANIZACION = "O",
  PROCESO = "P",
  PLANTILLA = "L",
  CAMPO = "C",
  ESTADO = "A",
  TRANSICION = "T",
  REPORTE = "E",
  ROL = "R",
  API_SERVICE = "W",
  SERVIDOR = "S",
  CATALOG = "G",
  ACCOUNT = "K",
}

export enum FormatoCampoSimboloEnum {
  T = '📝',
  F = '📅',
  Z = '🔄',
  N = '🔢',
  I = '⚙️',
  J = '📦',
  A = '📁',
  B = '🧩',
  G = '🛠️',
  U = '🟢',
  Q = '🧾',
  S = '📚',
  P = '📍',
  M = '🗾',
  V = '💡',
  C = '🔗'
}

