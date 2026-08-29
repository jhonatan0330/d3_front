import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { vi } from 'vitest';
import { Subject } from 'rxjs';
import { UtilsService } from './utils.service';
import { FormComponent } from '../form/form.component';
import { SuccessComponent } from '../form/success/success.component';
import { TransferFormComponent } from 'app/notification/transfer-form/transfer-form.component';
import { TrazabilityComponent } from 'app/document/trazability/trazability.component';
import { ManualFormComponent } from 'app/accounting/manual-form/manual-form.component';
import { ContactsDetailsComponent } from 'app/users/detail_persons/detail-person.component';
import { SettingsSecurityComponent } from 'app/authentication/settings/security/security.component';
import { DocumentTemplateFormComponent } from 'app/configuration/document-templates/document-template-form.component';
import { dfaComponent } from 'app/authentication/DFA/dfa';
import { DocumentTemplateFieldDetailComponent } from 'app/configuration/document-templates/document-template-fields/document-template-field-detail.component';
import { DocumentTemplateFieldFormComponent } from 'app/configuration/document-templates/document-template-fields/document-template-field-form.component';
import { PropertyModalComponent } from 'app/configuration/shared/property-modal.component';

describe('UtilsService', () => {
  let service: UtilsService;
  let dialogOpen: ReturnType<typeof vi.fn>;

  const makeDialogRef = () => {
    const afterClosed$ = new Subject<any>();
    return {
      afterClosed: vi.fn(() => afterClosed$.asObservable()),
      close: vi.fn(),
      emitClosed: (v?: any) => afterClosed$.next(v),
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.className = '';

    dialogOpen = vi.fn(() => makeDialogRef());

    TestBed.configureTestingModule({
      providers: [
        UtilsService,
        { provide: MatDialog, useValue: { open: dialogOpen } },
      ],
    });

    service = TestBed.inject(UtilsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('simple modals pass correct component and data', () => {
    it('modalWithParams should open FormComponent with full data mapping and default flags', () => {
      const pedido = { llaveTabla: 'd1' } as any;

      service.modalWithParams(pedido);

      expect(dialogOpen).toHaveBeenCalledWith(
        FormComponent,
        expect.objectContaining({
          disableClose: true,
          data: {
            data: pedido,
            close2Save: false,
            identificador: null,
            saveInField: false,
            openQuickTransitionAfterSave: null,
          },
        })
      );
    });

    it('modalWithParams should map explicit flags', () => {
      service.modalWithParams(null, true, 'id9', true, true);

      const config = dialogOpen.mock.calls[0][1];
      expect(config.data).toEqual({
        data: null,
        close2Save: true,
        identificador: 'id9',
        saveInField: true,
        openQuickTransitionAfterSave: true,
      });
    });

    it('modalWithParams should return afterClosed stream', () => {
      const result = service.modalWithParams(null);
      result.subscribe(v => expect(v).toBe('closed'));
      const ref = dialogOpen.mock.results[0].value;
      ref.emitClosed('closed');
    });

    it('modalSuccess should open SuccessComponent with html data', () => {
      service.modalSuccess('<b>ok</b>');

      expect(dialogOpen).toHaveBeenCalledWith(
        SuccessComponent,
        expect.objectContaining({ data: { data: '<b>ok</b>' } })
      );
    });

    it('modalTransfer should open TransferFormComponent', () => {
      service.modalTransfer('doc1', 'P', 't1', 'srv');

      expect(dialogOpen).toHaveBeenCalledWith(
        TransferFormComponent,
        expect.objectContaining({
          disableClose: false,
          data: { document: 'doc1', state: 'P', template: 't1', server: 'srv' },
        })
      );
    });

    it('modalTrace should open TrazabilityComponent with trace payload', () => {
      service.modalTrace('doc1', 't1', 'srv', 'Factura', 'A', 'P');

      expect(dialogOpen).toHaveBeenCalledWith(
        TrazabilityComponent,
        expect.objectContaining({
          data: {
            document: 'doc1', template: 't1', server: 'srv',
            documentName: 'Factura', documentState: 'A', state: 'P',
          },
        })
      );
    });

    it('modalVoucher should open ManualFormComponent with key and catalogId', () => {
      service.modalVoucher('k1', 'cat1');

      expect(dialogOpen).toHaveBeenCalledWith(
        ManualFormComponent,
        expect.objectContaining({ data: { key: 'k1', catalogId: 'cat1' } })
      );
    });

    it('modalUser should open ContactsDetailsComponent', () => {
      service.modalUser('u1');

      expect(dialogOpen).toHaveBeenCalledWith(
        ContactsDetailsComponent,
        expect.objectContaining({ data: { key: 'u1' } })
      );
    });

    it('modalUserChangePassOther should open dfaComponent with UsuarioDTO', () => {
      const usuario = { llaveTabla: 'u1' } as any;

      service.modalUserChangePassOther(usuario);

      expect(dialogOpen).toHaveBeenCalledWith(
        dfaComponent,
        expect.objectContaining({ disableClose: false, data: { key: usuario } })
      );
    });

    it('modalUserChangePass should open SettingsSecurityComponent without data', () => {
      service.modalUserChangePass();

      expect(dialogOpen).toHaveBeenCalledWith(SettingsSecurityComponent, expect.any(Object));
    });

    it('fieldEditModalFlex should open AddFieldComponent with template only', () => {
      service.fieldEditModalFlex('t1');

      expect(dialogOpen).toHaveBeenCalledWith(
        AddFieldComponent,
        expect.objectContaining({ data: { template: 't1' } })
      );
    });

    it('fieldAddModalFlex should open AddFieldComponent with campo', () => {
      const campo = { campo: 'c1' } as any;

      service.fieldAddModalFlex('t1', campo);

      expect(dialogOpen).toHaveBeenCalledWith(
        AddFieldComponent,
        expect.objectContaining({ data: { template: 't1', campo } })
      );
    });

    it('propertyAddModalFlex should open AddPropertyComponent', () => {
      const tipo = { llaveTabla: 'tipo1' } as any;

      service.propertyAddModalFlex('t1', tipo);

      expect(dialogOpen).toHaveBeenCalledWith(
        AddPropertyComponent,
        expect.objectContaining({ data: { template: 't1', propiedad: undefined, tipo } })
      );
    });
  });

  describe('modalFlex singleton behavior', () => {
    it('should open FlexComponent with flex-right-panel class', () => {
      service.modalFlex('t1');

      const [component, config] = dialogOpen.mock.calls[0];
      expect(component).toBe(FlexComponent);
      expect(config.panelClass).toBe('flex-right-panel');
      expect(config.hasBackdrop).toBe(false);
    });

    it('should close previous instance when opened again', () => {
      service.modalFlex('t1');
      const firstRef = dialogOpen.mock.results[0].value;

      service.modalFlex('t2');

      expect(firstRef.close).toHaveBeenCalled();
    });

    it('should reset internal reference after close', () => {
      service.modalFlex('t1');
      const firstRef = dialogOpen.mock.results[0].value;

      firstRef.emitClosed();

      service.modalFlex('t2');
      const secondCall = dialogOpen.mock.calls[1];
      expect(secondCall[1].data.template).toBe('t2');
    });
  });

  describe('fieldModalFlex singleton + body class behavior', () => {
    it('should open FieldComponent and add flex-panel-open to body', () => {
      service.fieldModalFlex('t1', 'tipoA');

      const [component, config] = dialogOpen.mock.calls[0];
      expect(component).toBe(FieldComponent);
      expect(config.data).toEqual({ template: 't1', tipo: 'tipoA' });
      expect(document.body.classList.contains('flex-panel-open')).toBe(true);
    });

    it('should remove flex-panel-open after close', () => {
      service.fieldModalFlex('t1');
      const ref = dialogOpen.mock.results[0].value;

      ref.emitClosed();

      expect(document.body.classList.contains('flex-panel-open')).toBe(false);
    });

    it('should close previous instance when opened again', () => {
      service.fieldModalFlex('t1');
      const firstRef = dialogOpen.mock.results[0].value;

      service.fieldModalFlex('t2');

      expect(firstRef.close).toHaveBeenCalled();
      expect(document.body.classList.contains('flex-panel-open')).toBe(true);
    });
  });
});
