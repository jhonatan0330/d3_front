import type { PropiedadDTO as SharedPropiedadDTO } from 'app/shared/shared.domain';

export type PropiedadDTO = Partial<SharedPropiedadDTO> &
  Pick<SharedPropiedadDTO, 'nombre' | 'key' | 'tipo' | 'valor'>;

export interface MetricasDTO {
  nombre: string;
  valorSuperior: number | null;
  valorInferior: number | null;
  color: string;
}

export interface DatoTablaDTO {
  key: string;
  state?: string;
  catalog?: string;
  account?: string;
  accountName?: string;
  accountCode?: string;
  timeFrame?: string;
  timeFrameName?: string;
  quantity?: number;
  lastBalance?: number;
  nextBalance?: number;
  positive?: number;
  negative?: number;
  value?: number;
  fecha?: string;
  descripcion?: string;
  valor?: number;
}

export interface IndicadorResultadoDTO {
  valor: number | null;
  valor_antes?: number | null;
  valor_despues?: number | null;
  fecha?: string;
  key?: string;
}

export interface IndicadorDTO {
  llaveTabla: string;
  nombre: string;
  codigo: string;
  proceso: string;
  imagen: string;
  estado: string;
  propiedades?: PropiedadDTO[];
  metricas?: MetricasDTO[];
  periodo?: any;
  datos?: DatoTablaDTO[];
}

export interface Indicador extends IndicadorDTO {
  propiedades: PropiedadDTO[];
  metricas: MetricasDTO[];
  datos: DatoTablaDTO[];
}