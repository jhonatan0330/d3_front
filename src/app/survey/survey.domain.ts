import { BasicDTO } from "app/shared/domain/sw42.domain";

export class EncuestaDTO extends BasicDTO {
  nombre: string;
  fechaInicio: Date;
  fechaFin: Date;
  fechaEjecucion: Date;
  colaborativa: boolean;
  rol: string;
  cliente: string;
  grupos: EncuestaGrupoDTO[];
}
export class EncuestaGrupoDTO extends BasicDTO {
  codigo: string;
  nombre: string;
  encuesta: string;
  numeroPreguntas: number;
  numeroRespuestasUsuario: number;
  respuestas: EncuestaRespuestaDTO[];
  usuario: string;
  preguntas: EncuestaPreguntaDTO[];
}

export class EncuestaPreguntaDTO extends BasicDTO {
  codigo: string;
  nombre: string;
  grupo: string;
  grupoNombre: string;
  grupoCodigo: string;
  tipo: string;
  descripcion: string;
  restriccion: string;
  opciones: EncuestaOpcionRespuestaDTO[];
}

export class EncuestaOpcionRespuestaDTO extends BasicDTO {
  codigo: string;
  nombre: string;
  imagen: string;
  pregunta: string;
}

export class EncuestaRespuestaDTO extends BasicDTO {
  pregunta;
  fecha: Date;
  usuario;
  respuestaBoolean: boolean;
  respuestaOpcion;
  comentario;
}
