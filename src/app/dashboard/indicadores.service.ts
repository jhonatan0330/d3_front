import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

export interface Accion {
  id: number;
  nombre: string;
  imagen: string;
  plantilla: string;
}

export interface Periodo {
  id: number;
  nivel: 'full' | 'año' | 'mes' | 'dia';
  fechaInicial: string;
  fechaFinal: string;
}

export interface Indicador {
  id: number;
  nombre: string;
  icono: string;
  acciones: Accion[];
  periodo: Periodo;
}

export interface ResultadoIndicador {
  valor: number;
  periodo: Periodo;
  valor_antes: number;
  valor_despues: number;
}

export interface DatoTabla {
  id: number;
  fecha: string;
  descripcion: string;
  valor: number;
}

@Injectable({
  providedIn: 'root'
})
export class IndicadoresService {

  private indicadores: Indicador[] = [
    {
      id: 1,
      nombre: 'Ventas Totales',
      icono: 'assets/icons/ventas-totales.svg',
      acciones: [
        {
          id: 101,
          nombre: 'Ver detalle',
          imagen: 'assets/templates/ver-detalle.png',
          plantilla: 'VENTAS'
        },
        {
          id: 102,
          nombre: 'Comparar períodos',
          imagen: 'assets/templates/comparar-periodos.png',
          plantilla: 'COMPARAR_PERIODOS'
        },
        {
          id: 103,
          nombre: 'Exportar reporte',
          imagen: 'assets/templates/exportar.png',
          plantilla: 'REPORTE_VENTAS'
        }
      ],
      periodo: {
        id: 1001,
        nivel: 'mes',
        fechaInicial: '2026-08-01',
        fechaFinal: '2026-08-31'
      }
    },

    {
      id: 2,
      nombre: 'Cantidad de Ventas',
      icono: 'assets/icons/cantidad-ventas.svg',
      acciones: [
        {
          id: 201,
          nombre: 'Ver ventas',
          imagen: 'assets/templates/ver-ventas.png',
          plantilla: 'VENTAS'
        },
        {
          id: 202,
          nombre: 'Analizar tendencia',
          imagen: 'assets/templates/tendencia.png',
          plantilla: 'TENDENCIA_VENTAS'
        }
      ],
      periodo: {
        id: 2001,
        nivel: 'mes',
        fechaInicial: '2026-08-01',
        fechaFinal: '2026-08-31'
      }
    },

    {
      id: 3,
      nombre: 'Ticket Promedio',
      icono: 'assets/icons/ticket-promedio.svg',
      acciones: [
        {
          id: 301,
          nombre: 'Ver evolución',
          imagen: 'assets/templates/evolucion.png',
          plantilla: 'EVOLUCION_TICKET'
        },
        {
          id: 302,
          nombre: 'Comparar vendedores',
          imagen: 'assets/templates/comparar-vendedores.png',
          plantilla: 'COMPARAR_VENDEDORES'
        }
      ],
      periodo: {
        id: 3001,
        nivel: 'mes',
        fechaInicial: '2026-08-01',
        fechaFinal: '2026-08-31'
      }
    },

    {
      id: 4,
      nombre: 'Crecimiento de Ventas',
      icono: 'assets/icons/crecimiento-ventas.svg',
      acciones: [
        {
          id: 401,
          nombre: 'Ver crecimiento',
          imagen: 'assets/templates/crecimiento.png',
          plantilla: 'CRECIMIENTO_VENTAS'
        },
        {
          id: 402,
          nombre: 'Comparar año anterior',
          imagen: 'assets/templates/comparar-anio.png',
          plantilla: 'COMPARAR_ANIO'
        }
      ],
      periodo: {
        id: 4001,
        nivel: 'año',
        fechaInicial: '2026-01-01',
        fechaFinal: '2026-12-31'
      }
    },

    {
      id: 5,
      nombre: 'Cumplimiento de Meta',
      icono: 'assets/icons/cumplimiento-meta.svg',
      acciones: [
        {
          id: 501,
          nombre: 'Ver cumplimiento',
          imagen: 'assets/templates/cumplimiento.png',
          plantilla: 'CUMPLIMIENTO'
        },
        {
          id: 502,
          nombre: 'Ver metas',
          imagen: 'assets/templates/metas.png',
          plantilla: 'METAS'
        },
        {
          id: 503,
          nombre: 'Analizar desviaciones',
          imagen: 'assets/templates/desviaciones.png',
          plantilla: 'DESVIACIONES'
        }
      ],
      periodo: {
        id: 5001,
        nivel: 'mes',
        fechaInicial: '2026-08-01',
        fechaFinal: '2026-08-31'
      }
    }
  ];

  constructor() {}

  /**
   * Simula:
   * GET /api/indicadores
   */
  getIndicadores(): Observable<Indicador[]> {
    return of(this.indicadores).pipe(
      delay(500)
    );
  }

  /**
   * Simula:
   * GET /api/indicadores/:id
   */
  getIndicador(id: number): Observable<Indicador | undefined> {
    const indicador = this.indicadores.find(
      indicador => indicador.id === id
    );

    return of(indicador).pipe(
      delay(300)
    );
  }

  /**
   * Simula:
   * POST /api/indicadores/resultado
   *
   * Recibe:
   * {
   *   indicadorId: 1,
   *   periodo: {...}
   * }
   */
  getResultadoIndicador(
    indicadorId: number,
    periodo: Periodo
  ): Observable<ResultadoIndicador> {

    const resultados: Record<number, number> = {
      1: 125000000,
      2: 3480,
      3: 35977,
      4: 18.5,
      5: 92.4
    };

    const valor = resultados[indicadorId] ?? 0;

    const valorAntes = Math.round(valor * 0.85);
    const valorDespues = Math.round(valor * 1.08);

    const resultado: ResultadoIndicador = {
      valor,
      periodo,
      valor_antes: valorAntes,
      valor_despues: valorDespues
    };

    return of(resultado).pipe(
      delay(800)
    );
  }

  /**
   * Simula:
   * GET /api/indicadores/:id/tabla
   */
  getTablaIndicador(
    indicadorId: number
  ): Observable<DatoTabla[]> {

    const tablas: Record<number, DatoTabla[]> = {
      1: [
        { id: 1, fecha: '2026-08-01', descripcion: 'Ventas zona norte', valor: 45000000 },
        { id: 2, fecha: '2026-08-08', descripcion: 'Ventas zona sur', valor: 32000000 },
        { id: 3, fecha: '2026-08-15', descripcion: 'Ventas zona oriente', valor: 28000000 },
        { id: 4, fecha: '2026-08-22', descripcion: 'Ventas zona occidente', valor: 20000000 }
      ],
      2: [
        { id: 1, fecha: '2026-08-01', descripcion: 'Facturas emitidas', valor: 950 },
        { id: 2, fecha: '2026-08-08', descripcion: 'Facturas emitidas', valor: 870 },
        { id: 3, fecha: '2026-08-15', descripcion: 'Facturas emitidas', valor: 1020 },
        { id: 4, fecha: '2026-08-22', descripcion: 'Facturas emitidas', valor: 640 }
      ],
      3: [
        { id: 1, fecha: '2026-08-01', descripcion: 'Ticket promedio semanal', valor: 35200 },
        { id: 2, fecha: '2026-08-08', descripcion: 'Ticket promedio semanal', valor: 36850 },
        { id: 3, fecha: '2026-08-15', descripcion: 'Ticket promedio semanal', valor: 34100 },
        { id: 4, fecha: '2026-08-22', descripcion: 'Ticket promedio semanal', valor: 37760 }
      ],
      4: [
        { id: 1, fecha: '2026-03-31', descripcion: 'Crecimiento trimestre 1', valor: 12.4 },
        { id: 2, fecha: '2026-06-30', descripcion: 'Crecimiento trimestre 2', valor: 18.5 },
        { id: 3, fecha: '2026-09-30', descripcion: 'Crecimiento trimestre 3', valor: 21.3 },
        { id: 4, fecha: '2026-12-31', descripcion: 'Crecimiento trimestre 4', valor: 24.7 }
      ],
      5: [
        { id: 1, fecha: '2026-02-28', descripcion: 'Cumplimiento mensual', valor: 88.2 },
        { id: 2, fecha: '2026-04-30', descripcion: 'Cumplimiento mensual', valor: 91.5 },
        { id: 3, fecha: '2026-06-30', descripcion: 'Cumplimiento mensual', valor: 90.1 },
        { id: 4, fecha: '2026-08-31', descripcion: 'Cumplimiento mensual', valor: 92.4 }
      ]
    };

    return of(tablas[indicadorId] ?? []).pipe(
      delay(600)
    );
  }
}