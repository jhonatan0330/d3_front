import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AccountDTO } from './domain/AccountDTO';
import { CatalogDTO } from './domain/CatalogDTO';
import { ManualDTO } from './domain/ManualDTO';
import { ResultMapDTO } from './domain/ResultMapDTO';
import { Voucher } from './domain/Voucher';
import { VoucherPrepareRequest } from './domain/VoucherPrepareRequest';
import { LocalStoreService } from 'app/shared/local-store.service';
import { SharedIdResponse } from 'app/shared/api-types';
import { IndicadorDTO } from './domain/IndicadorDTO';

const PEDIDOS_INDICADOR_MOCK_BASE: IndicadorDTO = {
  llaveTabla: 'pedidos',
  nombre: 'Pedidos',
  codigo: 'IND-003',
  proceso: 'Servicio',
  imagen: 'receipt',
  estado: 'ACTIVO',
  propiedades: [
    {
      llaveTabla: 'e2629f829334478db7b66a50ddd04500',
      estado: 'A',
      propiedadValor: 'PROP_420',
      tipo: 'I',
      nombre: 'ACCIONES',
      key: 'ACCIONES',
      campo: '6110f713a0e04cd9a587d52cabce444e',
      valor: '5c41e92914f44275befede22aff162a1',
      relaciones: 0,
    },
  ],
  metricas: [
    {
      nombre: 'Pedidos bajos',
      valorSuperior: 100,
      valorInferior: 0,
      color: '#EF4444',
    },
    {
      nombre: 'Pedidos medios',
      valorSuperior: 200,
      valorInferior: 100,
      color: '#F59E0B',
    },
    {
      nombre: 'Pedidos altos',
      valorSuperior: null,
      valorInferior: 200,
      color: '#10B981',
    },
  ],
  periodo: {
    key: 'dia-2026-11-07',
    state: 'ACTIVO',
    level: 3,
    code: '20261107',
    startDate: '2026-11-07T00:00:00.000Z',
    endDate: '2026-11-07T23:59:59.999Z',
    year: 2026,
    month: 11,
    day: 7,
    hour: 0,
    minute: 0,
  },
  datos: [
    {
      key: 'pedidos-1',
      state: 'ACTIVO',
      catalog: 'pedidos',
      account: 'pedidos',
      accountName: 'Pedidos',
      accountCode: 'IND-003-01',
      timeFrame: 'dia-2026-11-07',
      timeFrameName: '2026-11-07',
      quantity: 142,
      lastBalance: 0,
      nextBalance: 0,
      positive: 0,
      negative: 0,
      value: 142,
    },
  ],
};

const buildMetricScale = (labels: string[], colors: string[], values: Array<[number | null, number | null]>) =>
  labels.map((label, index) => ({
    nombre: label,
    valorInferior: values[index][0],
    valorSuperior: values[index][1],
    color: colors[index],
  }));

const PEDIDOS_INDICADOR_MOCKS: IndicadorDTO[] = [
  {
    ...PEDIDOS_INDICADOR_MOCK_BASE,
    llaveTabla: 'pedidos-1',
    codigo: 'IND-003-1',
    nombre: 'Pedidos',
    datos: [{
      ...PEDIDOS_INDICADOR_MOCK_BASE.datos?.[0],
      key: 'pedidos-1',
      account: 'pedidos-1',
      accountName: 'Pedidos 1',
      accountCode: 'IND-003-1',
      value: 142,
    }],
    metricas: buildMetricScale(
      ['Bajo', 'Medio', 'Alto'],
      ['#EF4444', '#F59E0B', '#10B981'],
      [[0, 100], [100, 200], [200, null]]
    ),
  },
  {
    ...PEDIDOS_INDICADOR_MOCK_BASE,
    llaveTabla: 'pedidos-2',
    codigo: 'IND-003-2',
    nombre: 'Facturación',
    datos: [{
      ...PEDIDOS_INDICADOR_MOCK_BASE.datos?.[0],
      key: 'pedidos-2',
      account: 'pedidos-2',
      accountName: 'Facturación 2',
      accountCode: 'IND-003-2',
      value: 860,
    }],
    metricas: [],
  },
  {
    ...PEDIDOS_INDICADOR_MOCK_BASE,
    llaveTabla: 'pedidos-3',
    codigo: 'IND-003-3',
    nombre: 'Cumplimiento',
    datos: [{
      ...PEDIDOS_INDICADOR_MOCK_BASE.datos?.[0],
      key: 'pedidos-3',
      account: 'pedidos-3',
      accountName: 'Cumplimiento 3',
      accountCode: 'IND-003-3',
      value: 344,
    }],
    metricas: buildMetricScale(
      ['Muy bajo', 'Bajo', 'Normal', 'Alerta', 'Bueno', 'Excelente', 'Muy alto', 'Óptimo'],
      ['#F87171', '#FBBF24', '#F59E0B', '#FB7185', '#34D399', '#10B981', '#0EA5E9', '#2563EB'],
      [[0, 25], [25, 50], [50, 75], [75, 100], [100, 125], [125, 150], [150, 175], [175, null]]
    ),
  },
  {
    ...PEDIDOS_INDICADOR_MOCK_BASE,
    llaveTabla: 'pedidos-4',
    codigo: 'IND-003-4',
    nombre: 'Clientes',
    datos: [{
      ...PEDIDOS_INDICADOR_MOCK_BASE.datos?.[0],
      key: 'pedidos-4',
      account: 'pedidos-4',
      accountName: 'Clientes 4',
      accountCode: 'IND-003-4',
      value: 2350,
    }],
    metricas: buildMetricScale(
      ['Crítico', 'Bajo', 'Medio', 'Alto'],
      ['#DC2626', '#F97316', '#FACC15', '#22C55E'],
      [[0, 1000], [1000, 1800], [1800, 2600], [2600, null]]
    ),
  },
];

@Injectable({ providedIn: 'root' })
export class AccountingService {
  private http = inject(HttpClient);
  private ls = inject(LocalStoreService);


  public currentCatalog: CatalogDTO;

  getVouchers(catalogId: string): Observable<ManualDTO[]> {
    return this.http.get<ManualDTO[]>(this.ls.getUrlAccess('/accounting/voucher/' + catalogId));
  }

  getVoucher(key: string): Observable<Voucher> {
    return this.http.get<Voucher>(this.ls.getUrlAccess('/accounting/voucher/one/' + key));
  }

  createManual(voucher: Voucher): Observable<ManualDTO> {
    return this.http.post<ManualDTO>(this.ls.getUrlAccess('/accounting/voucher/manual'), voucher);
  }

  updateManual(voucher: Voucher): Observable<ManualDTO> {
    return this.http.post<ManualDTO>(this.ls.getUrlAccess('/accounting/voucher/manual'), voucher);
  }

  updateVoucher(voucher: ManualDTO): Observable<ManualDTO> {
    return this.http.post<ManualDTO>(this.ls.getUrlAccess('/accounting/voucher/manual'), voucher);
  }

  deleteVoucher(key: string): Observable<ManualDTO> {
    return this.http.delete<ManualDTO>(this.ls.getUrlAccess('/accounting/voucher/manual/' + key));
  }

  getBalance(catalogId: string): Observable<ResultMapDTO[]> {
    return this.http.get<ResultMapDTO[]>(this.ls.getUrlAccess('/accounting/plan/balance/' + catalogId));
  }

  getAccounts(catalogId: string, nameFilter: string | null = null): Observable<AccountDTO[]> {
    let params = '';
    if (nameFilter) { params = params + 'filter=' + nameFilter; }
    if (params.length !== 0) params = '?' + params;
    return this.http.get<AccountDTO[]>(this.ls.getUrlAccess('/accounting/plan/account/' + catalogId + params));
  }

  getAccount(catalog: string, key: string): Observable<AccountDTO> {
    return this.http.get<AccountDTO>(this.ls.getUrlAccess('/accounting/plan/account/' + catalog + '/' + key));
  }

  getCatalogs(): Observable<CatalogDTO[]> {
    return this.http.get<CatalogDTO[]>(this.ls.getUrlAccess('/accounting/plan/catalog'));
  }

  getCatalog(key: string): Observable<CatalogDTO> {
    return this.http.get<CatalogDTO>(this.ls.getUrlAccess('/accounting/plan/catalog/' + key));
  }


  getVoucherOfDocument(pPrepareVoucher: VoucherPrepareRequest): Observable<SharedIdResponse> {
    return this.http.post<SharedIdResponse>(this.ls.getUrlAccess('/accounting/voucher/document'),
      pPrepareVoucher
    );
  }

  generateVoucher(pPrepareVoucher: VoucherPrepareRequest): Observable<SharedIdResponse> {
    return this.http.post<SharedIdResponse>(
      this.ls.getUrlAccess('/accounting/voucher/generate-voucher'),
      pPrepareVoucher
    );
  }

  getIndicadoresMock(): Observable<IndicadorDTO[]> {
    return of(PEDIDOS_INDICADOR_MOCKS);
  }

  getIndicadorMock(llaveTabla?: string): Observable<IndicadorDTO> {
    const indicador = PEDIDOS_INDICADOR_MOCKS.find((item) => item.llaveTabla === llaveTabla)
      ?? PEDIDOS_INDICADOR_MOCKS[0];
    return of(indicador);
  }

}


