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
  relaciones: number;
  imagen: string;
  rol?: string;
  rolNombre?: string;
  rolExcluyente?: string;
  rolExcluyenteNombre?: string;
  fechaInicial?: string;
  fechaFinal?: string;
  usuario?: string;
  usuarioNombre?: string;
  usuarioExcluyente?: string;
  usuarioExcluyenteNombre?: string;
  bloqueo?: string;
  fechaDefinicion?: Date;
  fechaImplementacion?: Date;
  fechaEliminacion?: Date;
  usuarioCreacion?: string;
  usuarioEliminacion?: string;
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
  usoMotivo: string;
  imagen: string;
  usoRelaciones: string;
  pideFechas: boolean;
  privada: boolean;
}

export class PropiedadFilterDTO extends BasicFilterDTO {
  propiedadValor: string;
  tipo: string;
  nombre: string;
  key: string;
  campo: string;
}

export class PropiedadValorDefinidoFilterDTO extends BasicFilterDTO {
  origen: string;
  origenCategoria: string;
  codigo: string;
  nombre: string;
  grupo: string;
}

export class PropiedadCampoDTO extends BasicDTO {
    cambioCreacion: string;
    campo: string;
    fechaDefinicion: Date | null;
    fechaImplementacion: Date | null;
    key: string;
    motivo: string;
    nombre: string;
    propiedadValor: string;
    tipo: string;
    valor: string;
    texto?: string;
    relaciones: number;
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

export class RelacionInternaFilterDTO extends BasicFilterDTO {
    propiedad: string;
    propiedadNombre: string;
    plantilla: string;
    plantillaNombre: string;
    campo: string;
    campoNombre: string;
    auxiliar: string;
}