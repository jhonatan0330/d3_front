import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

export interface Accion {
  id: number;
  nombre: string;
  imagen: string;
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
          imagen: 'assets/templates/ver-detalle.png'
        },
        {
          id: 102,
          nombre: 'Comparar períodos',
          imagen: 'assets/templates/comparar-periodos.png'
        },
        {
          id: 103,
          nombre: 'Exportar reporte',
          imagen: 'assets/templates/exportar.png'
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
          imagen: 'assets/templates/ver-ventas.png'
        },
        {
          id: 202,
          nombre: 'Analizar tendencia',
          imagen: 'assets/templates/tendencia.png'
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
          imagen: 'assets/templates/evolucion.png'
        },
        {
          id: 302,
          nombre: 'Comparar vendedores',
          imagen: 'assets/templates/comparar-vendedores.png'
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
          imagen: 'assets/templates/crecimiento.png'
        },
        {
          id: 402,
          nombre: 'Comparar año anterior',
          imagen: 'assets/templates/comparar-anio.png'
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
          imagen: 'assets/templates/cumplimiento.png'
        },
        {
          id: 502,
          nombre: 'Ver metas',
          imagen: 'assets/templates/metas.png'
        },
        {
          id: 503,
          nombre: 'Analizar desviaciones',
          imagen: 'assets/templates/desviaciones.png'
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
}