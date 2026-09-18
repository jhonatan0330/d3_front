export interface IndicadorDTO {
  llaveTabla: string;
  estado: string;
  nombre: string;
  codigo: string;
  proceso: string;
  imagen: string;
  propiedades?: any[];
}

export interface IndicadorFilterDTO {
  llaveTabla?: string;
  estado?: string;
  nombre?: string;
  codigo?: string;
  proceso?: string;
}

export interface PeriodoDTO {
  id: number;
  nivel: 'full' | 'año' | 'mes' | 'dia';
  fechaInicial: string;
  fechaFinal: string;
}

export interface IndicadorResultadoDTO {
  valor: number;
  periodo: PeriodoDTO;
  valor_antes: number;
  valor_despues: number;
}

export interface DatoTablaDTO {
  llaveTabla: string;
  fecha: string;
  descripcion: string;
  valor: number;
}

export interface Accion {
  id: number;
  nombre: string;
  imagen: string;
  plantilla: string;
}

export interface Indicador {
  llaveTabla: string;
  nombre: string;
  codigo: string;
  proceso: string;
  imagen: string;
  estado: string;
  acciones: Accion[];
  periodo: PeriodoDTO;
}