import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { LoginService } from './login.service';
import { LocalStoreService } from 'app/shared/local-store.service';
import { OrganizacionDTO, UsuarioAutenticacionDTO, UsuarioDTO } from './authentication.domain';

describe('LoginService', () => {
  let service: LoginService;
  let httpMock: HttpTestingController;
  const localStorageGetItem = vi.fn();
  const localStorageSetItem = vi.fn();
  const localStorageGetUrlAccess = vi.fn().mockImplementation((path: string) => `http://api.test${path}`);

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        LoginService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: LocalStoreService,
          useValue: {
            getItem: localStorageGetItem,
            setItem: localStorageSetItem,
            getUrlAccess: localStorageGetUrlAccess,
          },
        },
      ],
    });

    service = TestBed.inject(LoginService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('signals', () => {
    it('user signal should start with empty UsuarioDTO', () => {
      const user = service.user();
      expect(user).toBeTruthy();
      expect(user instanceof UsuarioDTO).toBe(true);
    });

    it('company signal should start with empty OrganizacionDTO', () => {
      const company = service.company();
      expect(company).toBeTruthy();
      expect(company instanceof OrganizacionDTO).toBe(true);
    });

    it('slides signal should start empty', () => {
      expect(service.slides()).toEqual([]);
    });

    it('landing signal should start empty', () => {
      expect(service.landing()).toEqual([]);
    });

    it('headerSection signal should start empty', () => {
      expect(service.headerSection()).toEqual([]);
    });

    it('date signal should start null', () => {
      expect(service.date()).toBeNull();
    });
  });

  describe('setDate / clearDate', () => {
    it('should set date from Date object', () => {
      const d = new Date('2025-01-15');
      service.setDate(d);
      expect(service.date()).toEqual(d);
    });

    it('should set date from string', () => {
      service.setDate('2025-06-20');
      expect(service.date()).toEqual(new Date('2025-06-20'));
    });

    it('should clear date with null', () => {
      service.setDate('2025-01-01');
      service.setDate(null);
      expect(service.date()).toBeNull();
    });

    it('clearDate should set date to null', () => {
      service.setDate(new Date());
      service.clearDate();
      expect(service.date()).toBeNull();
    });
  });

  describe('setUserAndToken', () => {
    it('should set user and token from authDTO', () => {
      const authDTO = new UsuarioAutenticacionDTO();
      authDTO.token = 'test-token-123';
      authDTO.usuarioDTO = new UsuarioDTO();
      authDTO.usuarioDTO.llaveTabla = 'user-1';

      service.setUserAndToken(authDTO, null);

      expect(service.token).toBe('test-token-123');
      expect(service.user().llaveTabla).toBe('user-1');
      expect(localStorageSetItem).toHaveBeenCalledWith('JWT_TOKEN', 'test-token-123');
    });

    it('should clear user and token with null', () => {
      const authDTO = new UsuarioAutenticacionDTO();
      authDTO.token = 'test-token';
      authDTO.usuarioDTO = new UsuarioDTO();
      service.setUserAndToken(authDTO, null);

      service.setUserAndToken(null, null);

      expect(service.token).toBeNull();
      expect(service.user()).toBeNull();
    });
  });

  describe('checkTokenIsValid', () => {
    it('should return false when no token exists', () => {
      localStorageGetItem.mockReturnValue(null);

      let result: boolean;
      service.checkTokenIsValid().subscribe((r) => (result = r));

      expect(result!).toBe(false);
    });
  });

  describe('signin', () => {
    it('should return null when username and password are null without token', () => {
      const result = service.signin(null, null, null);
      expect(result).toBeNull();
    });

    it('should call HTTP on valid credentials', () => {
      const mockResponse: UsuarioAutenticacionDTO = {
        token: 'new-token',
        usuarioDTO: { llaveTabla: 'u1' } as UsuarioDTO,
        organizacion: { llaveTabla: 'org1' } as OrganizacionDTO,
        fechaMaxima: null,
        mensaje: null,
      };

      service.signin('admin', 'pass123', null).subscribe((res) => {
        expect(res.token).toBe('new-token');
      });

      const req = httpMock.expectOne('http://api.test/main/autenticarUsuarioAutenticacion');
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('isLoggedIn', () => {
    it('should return false when no token and no urlService', () => {
      localStorageGetItem.mockReturnValue(null);
      expect(service.isLoggedIn()).toBe(false);
    });
  });

  describe('setConfUrl', () => {
    it('should strip trailing slash', () => {
      service.setConfUrl('http://example.com/');
      expect(service.urlService).toBe('http://example.com');
    });

    it('should keep url without trailing slash', () => {
      service.setConfUrl('http://example.com');
      expect(service.urlService).toBe('http://example.com');
    });
  });

  describe('validateAccessModule', () => {
    it('should return false when company has no modules', () => {
      service.company.set({ llaveTabla: 'org1', propiedades: [] } as OrganizacionDTO);
      expect(service.validateAccessModule('ADMIN')).toBe(false);
    });

    it('should return false when company is empty', () => {
      service.company.set(new OrganizacionDTO());
      expect(service.validateAccessModule('ADMIN')).toBe(false);
    });
  });
});
