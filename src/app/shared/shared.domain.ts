export class BasicDTO {
  llaveTabla: string;
  estado: string;
}
export class BasicParamDTO extends BasicDTO {
  propiedades: PropiedadDTO[];
}

export class PropiedadDTO extends BasicDTO {
  propiedadValor: string;
  tipo: string;
  nombre: string;
  key: string;
  campo: string;
  valor: string;
  texto: string;
  fechaDefinicion: Date;
  fechaImplementacion: Date;
  cambioCreacion: string;
  cambioEliminacion: string;
  rol: string;
  rolNombre: string;
  rolExcluyente: string;
  rolExcluyenteNombre: string;
  fechaInicial: Date;
  fechaFinal: Date;
  usuario: string;
  usuarioNombre: string;
  usuarioExcluyente: string;
  usuarioExcluyenteNombre: string;
  motivo: string;
  bloqueo: string;
}