export class BasicDTO {
  llaveTabla: string;
  estado: string;
}
export class BasicParamDTO extends BasicDTO {
  propiedades: PropiedadDTO[];
}

export class BasicFilterDTO {
  paginacionRegistroInicial: number;
  paginacionRegistroFinal: number;
  filtroParametro: string;
  llaveTabla: string;
  estado: string;
  securityToken: string;
}


export class PropiedadDTO extends BasicDTO {
  propiedadValor: string;
  tipo: string;
  nombre: string;
  key: string;
  campo: string;
  valor: string;
  texto: string;
  motivo: string;
}

export class PropiedadValorDefinidoDTO extends BasicDTO {
  origen: string;
  origenCategoria: string;
  codigo: string;
  nombre: string;
  grupo: string;
  textOculto: boolean;
  necesitaDesarrollo: boolean;
  incluirPreloadOrigen: boolean;
  multiple: boolean;
  pideRol: boolean;
  pideTiempoBloqueo: boolean;
  propiedadBoolean: boolean;
  pideUsuario: boolean;
  solicitaMotivo: boolean;
  pideFechas: boolean;
}