import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { TemplateService } from './template.service';
import { LocalStoreService } from 'app/shared/local-store.service';
import { NavigationService } from 'app/authorization/navigation/navigation.service';
import { DocumentoPlantillaDTO } from './model/sw42.domain';

describe('TemplateService', () => {
  let service: TemplateService;
  const navigationGenerate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        TemplateService,
        {
          provide: LocalStoreService,
          useValue: {
            getItem: vi.fn(),
            setItem: vi.fn(),
            getUrlAccess: vi.fn(),
          },
        },
        {
          provide: NavigationService,
          useValue: {
            generate: navigationGenerate,
          },
        },
      ],
    });

    service = TestBed.inject(TemplateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('template signal', () => {
    it('should start empty', () => {
      expect(service.template()).toEqual([]);
    });
  });

  describe('setTemplates', () => {
    it('should set templates into signal', () => {
      const templates: DocumentoPlantillaDTO[] = [
        { llaveTabla: 't1', nombre: 'Template 1', estado: null, proceso: null, imagen: null, server: null, propiedades: null, caracteristicas: null, estados: null, codigo: null },
        { llaveTabla: 't2', nombre: 'Template 2', estado: null, proceso: null, imagen: null, server: null, propiedades: null, caracteristicas: null, estados: null, codigo: null },
      ];

      service.setTemplates(templates);

      expect(service.template().length).toBe(2);
      expect(service.template()[0].nombre).toBe('Template 1');
    });

    it('should call navigationService.generate', () => {
      const templates: DocumentoPlantillaDTO[] = [
        { llaveTabla: null, nombre: 'Process 1', estado: null, proceso: 'proc1', imagen: null, server: null, propiedades: null, caracteristicas: null, estados: null, codigo: null },
      ];

      service.setTemplates(templates);

      expect(navigationGenerate).toHaveBeenCalled();
    });
  });

  describe('getTemplate', () => {
    beforeEach(() => {
      const templates: DocumentoPlantillaDTO[] = [
        { llaveTabla: 't1', nombre: 'Template 1', estado: 'P', proceso: null, imagen: null, server: null, propiedades: null, caracteristicas: null, estados: null, codigo: null },
        { llaveTabla: 't2', nombre: 'Template 2', estado: 'P', proceso: null, imagen: null, server: null, propiedades: null, caracteristicas: null, estados: null, codigo: null },
      ];
      service.setTemplates(templates);
    });

    it('should return template by llaveTabla', () => {
      const result = service.getTemplate('t1', null);
      expect(result).toBeTruthy();
      expect(result.nombre).toBe('Template 1');
    });

    it('should return null when template not found', () => {
      const result = service.getTemplate('nonexistent', null);
      expect(result == null).toBe(true);
    });

    it('should return null when template list is empty', () => {
      service.clear();
      const result = service.getTemplate('t1', null);
      expect(result == null).toBe(true);
    });
  });

  describe('getTemplateOfProcess', () => {
    it('should return templates matching process id', () => {
      const templates: DocumentoPlantillaDTO[] = [
        { llaveTabla: null, nombre: 'Proc A', estado: 'T', proceso: 'factura', imagen: null, server: null, propiedades: null, caracteristicas: null, estados: null, codigo: null },
        { llaveTabla: null, nombre: 'Proc B', estado: 'T', proceso: 'cotizacion', imagen: null, server: null, propiedades: null, caracteristicas: null, estados: null, codigo: null },
        { llaveTabla: 't1', nombre: 'List', estado: 'P', proceso: null, imagen: null, server: null, propiedades: null, caracteristicas: null, estados: null, codigo: null },
      ];
      service.setTemplates(templates);

      const result = service.getTemplateOfProcess('factura');
      expect(result.length).toBe(1);
      expect(result[0].nombre).toBe('Proc A');
    });

    it('should return empty when no templates match', () => {
      service.setTemplates([]);
      const result = service.getTemplateOfProcess('any');
      expect(result.length).toBe(0);
    });
  });

  describe('getProceso', () => {
    it('should return process template by proceso id', () => {
      const templates: DocumentoPlantillaDTO[] = [
        { llaveTabla: null, nombre: 'Factura', estado: 'T', proceso: 'factura', imagen: null, server: null, propiedades: null, caracteristicas: null, estados: null, codigo: null },
      ];
      service.setTemplates(templates);

      const result = service.getProceso('factura');
      expect(result).toBeTruthy();
      expect(result.nombre).toBe('Factura');
    });

    it('should match by codigo if proceso not found', () => {
      const templates: DocumentoPlantillaDTO[] = [
        { llaveTabla: null, nombre: 'Test', estado: 'T', proceso: null, imagen: null, server: null, propiedades: null, caracteristicas: null, estados: null, codigo: 'COD1' },
      ];
      service.setTemplates(templates);

      const result = service.getProceso('COD1');
      expect(result).toBeTruthy();
    });

    it('should return undefined when not found', () => {
      const templates: DocumentoPlantillaDTO[] = [
        { llaveTabla: 't1', nombre: 'List', estado: 'P', proceso: null, imagen: null, server: null, propiedades: null, caracteristicas: null, estados: null, codigo: null },
      ];
      service.setTemplates(templates);

      const result = service.getProceso('nonexistent');
      expect(result).toBeUndefined();
    });
  });

  describe('clear', () => {
    it('should reset templates to empty', () => {
      service.setTemplates([
        { llaveTabla: 't1', nombre: 'T1', estado: null, proceso: null, imagen: null, server: null, propiedades: null, caracteristicas: null, estados: null, codigo: null },
      ]);
      expect(service.template().length).toBe(1);

      service.clear();
      expect(service.template().length).toBe(0);
    });
  });

  describe('getColor', () => {
    it('should return null for empty stateId', () => {
      expect(service.getColor('')).toBeNull();
      expect(service.getColor(null)).toBeNull();
    });

    it('should return null when no templates loaded', () => {
      expect(service.getColor('someState')).toBeNull();
    });
  });

  describe('addRelations / getPropertyRelation', () => {
    it('should add and retrieve relations', () => {
      service.addRelations([{ propiedad: 'field1', valor: 'rel1' } as any]);
      service.addRelations([{ propiedad: 'field1', valor: 'rel2' } as any]);

      const result = service.getPropertyRelation('field1');
      expect(result.length).toBe(2);
    });

    it('should return undefined when no relations', () => {
      const result = service.getPropertyRelation('field1');
      expect(result).toBeUndefined();
    });
  });
});
