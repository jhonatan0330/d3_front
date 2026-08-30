import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { vi } from 'vitest';
import { of } from 'rxjs';
import { ApiService } from './api.service';
import { LocalStoreService } from 'app/shared/local-store.service';

describe('ApiService', () => {
  let service: ApiService;
  const httpGet = vi.fn();
  const httpPost = vi.fn();
  const getUrlAccess = vi.fn((path: string) => 'http://srv' + path);

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        ApiService,
        {
          provide: HttpClient,
          useValue: { get: httpGet, post: httpPost },
        },
        {
          provide: LocalStoreService,
          useValue: { getUrlAccess },
        },
      ],
    });

    service = TestBed.inject(ApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('GET endpoints', () => {
    it('listarPlantillas should GET templates by profile with server', () => {
      httpGet.mockReturnValue(of([{ llaveTabla: 't1' }]));

      const result = service.listarPlantillas('USER', 'srv1');

      result.subscribe(data => expect(data.length).toBe(1));
      expect(getUrlAccess).toHaveBeenCalledWith('/template/getTemplates/USER', 'srv1');
      expect(httpGet).toHaveBeenCalledWith('http://srv/template/getTemplates/USER');
    });

    it('listarPlantillas should default server to null', () => {
      httpGet.mockReturnValue(of([]));

      service.listarPlantillas('ADMIN').subscribe();

      expect(getUrlAccess).toHaveBeenCalledWith('/template/getTemplates/ADMIN', null);
    });

    it('consultarInventario should GET inventory by product id', () => {
      httpGet.mockReturnValue(of([]));

      service.consultarInventario('p1', null).subscribe();

      expect(getUrlAccess).toHaveBeenCalledWith('/document/getInventory/p1', null);
    });

    it('getMessageInFiledProccess should GET message by property and value', () => {
      httpGet.mockReturnValue(of({ id: 'x' }));

      service.getMessageInFiledProccess('prop', 'val').subscribe(res => {
        expect((res as any).id).toBe('x');
      });
      expect(getUrlAccess).toHaveBeenCalledWith('/document/api/getMessageToProcessField/prop/val', null);
    });

    it('searchUserByRol should GET user by role query', () => {
      httpGet.mockReturnValue(of({ llaveTabla: 'u1' }));

      service.searchUserByRol('rolX').subscribe();

      expect(getUrlAccess).toHaveBeenCalledWith('/user/document/rolX');
    });

    it('getImage should GET raw url with blob responseType without urlAccess', () => {
      httpGet.mockReturnValue(of(new Blob()));

      service.getImage('http://img/1.png').subscribe();

      expect(getUrlAccess).not.toHaveBeenCalledWith('http://img/1.png');
      expect(httpGet).toHaveBeenCalledWith('http://img/1.png', { responseType: 'blob' });
    });
  });

  describe('POST endpoints', () => {
    it('listarDocumentos should POST filter to getDocuments', () => {
      httpPost.mockReturnValue(of([]));
      const filtro = { plantilla: 't1' } as any;

      service.listarDocumentos(filtro, null).subscribe();

      expect(httpPost).toHaveBeenCalledWith('http://srv/document/getDocuments', filtro);
    });

    it('relacionesPropiedad should POST filter to getPropertyRelations', () => {
      httpPost.mockReturnValue(of([]));
      const filtro = { propiedad: 'x' } as any;

      service.relacionesPropiedad(filtro, 'srv2').subscribe();

      expect(getUrlAccess).toHaveBeenCalledWith('/template/getPropertyRelations', 'srv2');
      expect(httpPost).toHaveBeenCalledWith('http://srv/template/getPropertyRelations', filtro);
    });

    it('validarTipoProcesoCarga should POST to validateLoad', () => {
      httpPost.mockReturnValue(of({}));
      const filtro = { campo: 'c' } as any;

      service.validarTipoProcesoCarga(filtro, null).subscribe();

      expect(getUrlAccess).toHaveBeenCalledWith('/template/validateLoad', null);
    });

    it('obtenerCampos should build DocumentoPlantillaDTO with plantillaId', () => {
      httpPost.mockReturnValue(of({}));

      service.obtenerCampos('t9', null).subscribe();

      expect(getUrlAccess).toHaveBeenCalledWith('/document/api/obtenerCampos', null);
      expect(httpPost).toHaveBeenCalledWith(
        'http://srv/document/api/obtenerCampos',
        expect.objectContaining({ llaveTabla: 't9' })
      );
    });

    it('consultarDocumento should POST filter', () => {
      httpPost.mockReturnValue(of({}));
      const filtro = { llaveTabla: 'd1' } as any;

      service.consultarDocumento(filtro, null).subscribe();

      expect(getUrlAccess).toHaveBeenCalledWith('/document/api/consultarDocumento', null);
      expect(httpPost).toHaveBeenCalledWith('http://srv/document/api/consultarDocumento', filtro);
    });

    it('validateBeforeNew should POST filter', () => {
      httpPost.mockReturnValue(of({}));

      service.validateBeforeNew({ plantilla: 't1' } as any, null).subscribe();

      expect(getUrlAccess).toHaveBeenCalledWith('/document/api/validateBeforeNew', null);
    });

    it('verificarToken should POST to /user/dfa', () => {
      httpPost.mockReturnValue(of({}));
      const usuario = { securityToken: 'tok' } as any;

      service.verificarToken(usuario).subscribe();

      expect(getUrlAccess).toHaveBeenCalledWith('/user/dfa', undefined);
      expect(httpPost).toHaveBeenCalledWith('http://srv/user/dfa', usuario);
    });

    it('ajustarEstado should POST to changeState', () => {
      httpPost.mockReturnValue(of({}));
      const ajuste = { estado: 'P' } as any;

      service.ajustarEstado(ajuste, null).subscribe();

      expect(getUrlAccess).toHaveBeenCalledWith('/document/api/changeState', null);
      expect(httpPost).toHaveBeenCalledWith('http://srv/document/api/changeState', ajuste);
    });
  });

  describe('guardarDocumento / saveByMassive (postDocumento helper)', () => {
    it('guardarDocumento should POST with non-duplicate session header', () => {
      httpPost.mockReturnValue(of({}));
      const documento = { llaveTabla: 'd1' } as any;

      service.guardarDocumento(documento, null, 'sess-1').subscribe();

      expect(getUrlAccess).toHaveBeenCalledWith('/document/api/guardarDocumento', null);
      expect(httpPost).toHaveBeenCalledWith('http://srv/document/api/guardarDocumento', documento, {
        headers: { 'non-duplicate': 'sess-1' },
      });
    });

    it('saveByMassive should reuse same helper with its own endpoint', () => {
      httpPost.mockReturnValue(of({}));
      const documento = { llaveTabla: 'd2' } as any;

      service.saveByMassive(documento, 'srv3', 'sess-2').subscribe();

      expect(getUrlAccess).toHaveBeenCalledWith('/document/api/saveByMassive', 'srv3');
      expect(httpPost).toHaveBeenCalledWith('http://srv/document/api/saveByMassive', documento, {
        headers: { 'non-duplicate': 'sess-2' },
      });
    });
  });

  describe('uploadFile', () => {
    it('should append file into FormData and POST it', () => {
      httpPost.mockReturnValue(of(null));

      const file = new File(['contenido'], 'foto.png');
      service.uploadFile(file, null).subscribe();

      expect(getUrlAccess).toHaveBeenCalledWith('/document/api/upload', null);
      const [url, formData] = httpPost.mock.calls[0];
      expect(url).toBe('http://srv/document/api/upload');
      expect(formData).toBeInstanceOf(FormData);
      const sentFile: File = formData.get('file');
      expect(sentFile.name).toBe('foto.png');
    });
  });

  describe('consultarDatosBase mapping', () => {
    it('should copy fixed fields and map dependientes to minimal DTOs', () => {
      httpPost.mockReturnValue(of({}));
      const campo = {
        campo: 'campoA',
        securityToken: 'tok',
        llaveTabla: 'lt',
        filtroParametro: 'fp',
        documento: 'doc',
        valorOpcion: 'op',
        valorText: 'txt',
        paginacionRegistroFinal: 10,
        paginacionRegistroInicial: 0,
        valorAuxiliar: 'aux',
        valorFechaMax: 'fmax',
        valorFechaMin: 'fmin',
        valorNumeroMax: 99,
        valorNumeroMin: 1,
        dependientes: [
          { valorOpcion: 'o1', valorNumero: 5, valorFecha: '2025-01-01', valorText: 't1', campo: 'c1', expedientes: 'e1', extraIgnored: 'zzz' },
        ],
      } as any;

      service.consultarDatosBase(campo, null).subscribe();

      const [, body] = httpPost.mock.calls[0];
      expect(body.campo).toBe('campoA');
      expect(body.securityToken).toBe('tok');
      expect(body.llaveTabla).toBe('lt');
      expect(body.filtroParametro).toBe('fp');
      expect(body.documento).toBe('doc');
      expect(body.valorOpcion).toBe('op');
      expect(body.valorText).toBe('txt');
      expect(body.paginacionRegistroFinal).toBe(10);
      expect(body.paginacionRegistroInicial).toBe(0);
      expect(body.valorAuxiliar).toBe('aux');
      expect(body.valorFechaMax).toBe('fmax');
      expect(body.valorFechaMin).toBe('fmin');
      expect(body.valorNumeroMax).toBe(99);
      expect(body.valorNumeroMin).toBe(1);
      expect(body.dependientes.length).toBe(1);
      expect(body.dependientes[0]).toEqual({
        valorOpcion: 'o1',
        valorNumero: 5,
        valorFecha: '2025-01-01',
        valorText: 't1',
        campo: 'c1',
        expedientes: 'e1',
      });
      expect(getUrlAccess).toHaveBeenCalledWith('/document/api/consultarDatosBase', null);
    });

    it('should leave dependientes undefined when input has none', () => {
      httpPost.mockReturnValue(of({}));
      const campo = { campo: 'x' } as any;

      service.consultarDatosBase(campo, null).subscribe();

      const [, body] = httpPost.mock.calls[0];
      expect(body.dependientes).toBeUndefined();
    });
  });
});
