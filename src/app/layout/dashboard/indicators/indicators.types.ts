import {
  Indicador,
  IndicadorDTO,
  IndicadorResultadoDTO,
  DatoTablaDTO,
  PeriodoDTO,
  Accion,
} from 'app/accounting/domain/accounting.types';

export interface IndicadorKPI extends Indicador {
  delta?: number;
  deltaColor?: 'positivo' | 'negativo' | 'neutro';
  badge?: string;
  badgeColor?: string;
  subtitulo?: string;
  icono?: string;
  trend?: 'up' | 'down' | 'stable';
}

export interface AlertaStock {
  id: string;
  severidad: 'critica' | 'advertencia' | 'info';
  titulo: string;
  mensaje: string;
  accion?: string;
}

export interface CanalAtencion {
  nombre: string;
  valor: number;
  pctTotal: number;
  icono: string;
  color: string;
}

export interface RendimientoPersonal {
  codigo: string;
  nombre: string;
  transacciones: number;
  ventas: number;
  estado: 'cuadre_ok' | 'sin_propina' | 'alerta';
}

export interface ProductoRotacion {
  nombre: string;
  unidades: number;
  pct: number;
  color: string;
}

export interface QuickAction {
  id: string;
  nombre: string;
  icono: string;
  color: string;
}

export type DashboardItem =
  | { tipo: 'kpi'; data: IndicadorKPI }
  | { tipo: 'alerta'; data: AlertaStock }
  | { tipo: 'canal'; data: CanalAtencion }
  | { tipo: 'rendimiento'; data: RendimientoPersonal }
  | { tipo: 'barra-horizontal'; data: ProductoRotacion[] }
  | { tipo: 'tabla'; data: DatoTablaDTO[] };

export { Indicador, IndicadorDTO, IndicadorResultadoDTO, DatoTablaDTO, PeriodoDTO, Accion };
