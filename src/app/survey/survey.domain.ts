import { BasicDTO } from "app/shared/shared.domain";

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
/*
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
/*
	
export class PostCalificacionFilterDTO extends BasicFilterDTO {
  usuario: string;
  fechaMin: Date;
  fechaMax: Date;
  respuesta: string;
  positivaFilter: boolean;
}
			
export class PostPreguntaFilterDTO extends BasicFilterDTO {
  campo: string;
  tipo: string;
  calificaciones: number;
  fechaMin: Date;
  fechaMax: Date;
  autor: string;
  autorImagen: string;
  autorNombre: string;
}

export class PostRespuestaFilterDTO extends BasicFilterDTO {
  calificacionesPositivas: number;
  calificacionesNegativas: number;
  fechaMin: Date;
  fechaMax: Date;
  autor: string;
  autorNombre: string;
  autorImagen: string;
  pregunta: string;
}
			*/