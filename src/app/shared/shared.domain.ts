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
  motivo: string;
}