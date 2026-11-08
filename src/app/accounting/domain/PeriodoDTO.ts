export interface PeriodoDTO {
  key?: string;
  state?: string;
  level?: number | string;
  code?: string;
  startDate?: string;
  endDate?: string;
  year?: number;
  month?: number;
  day?: number;
  hour?: number;
  minute?: number;
  id?: number;
  nivel?: 'full' | 'año' | 'mes' | 'dia';
  fechaInicial?: string;
  fechaFinal?: string;
}