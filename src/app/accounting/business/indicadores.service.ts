import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LocalStoreService } from 'app/shared/local-store.service';
import {
  Accion,
  DatoTablaDTO,
  Indicador,
  IndicadorDTO,
  IndicadorFilterDTO,
  IndicadorResultadoDTO,
  PeriodoDTO,
} from 'app/accounting/domain/accounting.types';

const DEFAULT_ACCIONES: Record<string, Accion[]> = {
  ventas_totales: [
    { id: 101, nombre: 'Ver detalle', imagen: 'favicon-32x32.png', plantilla: 'VENTAS' },
    { id: 102, nombre: 'Comparar períodos', imagen: 'favicon-32x32.png', plantilla: 'COMPARAR_PERIODOS' },
    { id: 103, nombre: 'Exportar reporte', imagen: 'favicon-32x32.png', plantilla: 'REPORTE_VENTAS' },
  ],
  cantidad_ventas: [
    { id: 201, nombre: 'Ver ventas', imagen: 'favicon-32x32.png', plantilla: 'VENTAS' },
    { id: 202, nombre: 'Analizar tendencia', imagen: 'favicon-32x32.png', plantilla: 'TENDENCIA_VENTAS' },
  ],
  ticket_promedio: [
    { id: 301, nombre: 'Ver evolución', imagen: 'favicon-32x32.png', plantilla: 'EVOLUCION_TICKET' },
    { id: 302, nombre: 'Comparar vendedores', imagen: 'favicon-32x32.png', plantilla: 'COMPARAR_VENDEDORES' },
  ],
  crecimiento_ventas: [
    { id: 401, nombre: 'Ver crecimiento', imagen: 'favicon-32x32.png', plantilla: 'CRECIMIENTO_VENTAS' },
    { id: 402, nombre: 'Comparar año anterior', imagen: 'favicon-32x32.png', plantilla: 'COMPARAR_ANIO' },
  ],
  cumplimiento_meta: [
    { id: 501, nombre: 'Ver cumplimiento', imagen: 'favicon-32x32.png', plantilla: 'CUMPLIMIENTO' },
    { id: 502, nombre: 'Ver metas', imagen: 'favicon-32x32.png', plantilla: 'METAS' },
    { id: 503, nombre: 'Analizar desviaciones', imagen: 'favicon-32x32.png', plantilla: 'DESVIACIONES' },
  ],
};

const DEFAULT_PERIODOS: Record<string, PeriodoDTO> = {
  ventas_totales: { id: 1001, nivel: 'mes', fechaInicial: '2026-08-01', fechaFinal: '2026-08-31' },
  cantidad_ventas: { id: 2001, nivel: 'mes', fechaInicial: '2026-08-01', fechaFinal: '2026-08-31' },
  ticket_promedio: { id: 3001, nivel: 'mes', fechaInicial: '2026-08-01', fechaFinal: '2026-08-31' },
  crecimiento_ventas: { id: 4001, nivel: 'año', fechaInicial: '2026-01-01', fechaFinal: '2026-12-31' },
  cumplimiento_meta: { id: 5001, nivel: 'mes', fechaInicial: '2026-08-01', fechaFinal: '2026-08-31' },
};

@Injectable({
  providedIn: 'root'
})
export class IndicadoresService {
  private http = inject(HttpClient);
  private ls = inject(LocalStoreService);

  getIndicadores(): Observable<IndicadorDTO[]> {
    const filter: IndicadorFilterDTO = { estado: 'A' };
    return this.http.post<IndicadorDTO[]>(this.ls.getUrlAccess('/configuration/indicators/list'), filter);
  }

  getIndicador(llaveTabla: string): Observable<IndicadorDTO> {
    return this.http.post<IndicadorDTO>(
      this.ls.getUrlAccess(`/configuration/indicators/${llaveTabla}`),
      {}
    );
  }

  getResultadoIndicador(
    llaveTabla: string,
    periodo: PeriodoDTO
  ): Observable<IndicadorResultadoDTO> {
    return this.http.post<IndicadorResultadoDTO>(
      this.ls.getUrlAccess('/configuration/indicators/result'),
      { indicadorId: llaveTabla, periodo }
    );
  }

  getTablaIndicador(llaveTabla: string): Observable<DatoTablaDTO[]> {
    return this.http.post<DatoTablaDTO[]>(
      this.ls.getUrlAccess(`/configuration/indicators/${llaveTabla}/table`),
      {}
    );
  }

  toIndicador(dto: IndicadorDTO): Indicador {
    return {
      ...dto,
      acciones: DEFAULT_ACCIONES[dto.codigo] ?? [],
      periodo: DEFAULT_PERIODOS[dto.codigo] ?? { id: 0, nivel: 'full', fechaInicial: '', fechaFinal: '' },
    };
  }
}