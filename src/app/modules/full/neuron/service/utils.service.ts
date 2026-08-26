import { Injectable, DOCUMENT, inject } from '@angular/core';

import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DocumentoPlantillaCaracteristicaDTO, PedidoVentaDTO, PropiedadCampoDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { FormComponent } from 'app/modules/full/neuron/form/form.component';
import { TransferFormComponent } from 'app/notification/transfer-form/transfer-form.component';
import { TrazabilityComponent } from 'app/document-transition/trazability/trazability.component';
import { SuccessComponent } from '../form/success/success.component';
import { ManualFormComponent } from 'app/accounting/manual-form/manual-form.component';
import { ContactsDetailsComponent } from 'app/persons/detail_persons/detail-person.component';
import { SettingsSecurityComponent } from 'app/authentication/settings/security/security.component';
import { UsuarioDTO } from 'app/authentication/authentication.domain';
import { DocumentTemplateFormComponent } from 'app/configuration-forms/document-templates/document-template-form.component';
import { dfaComponent } from 'app/authentication/DFA/dfa';
import { DocumentTemplateFieldFormComponent } from 'app/configuration-forms/document-templates/document-template-fields/document-template-field-form.component';
import { DocumentTemplateFieldDetailComponent } from 'app/configuration-forms/document-templates/document-template-fields/document-template-field-detail.component';
import { PropertyModalComponent } from 'app/configuration-forms/shared/property-modal.component';
import {  PropiedadValorDefinidoDTO } from 'app/shared/shared.domain';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  dialog = inject(MatDialog);
  private _document = inject(DOCUMENT);


  // Keep references to open right-side dialogs to ensure only one instance of each type is open
  private _fieldDialogRef: MatDialogRef<any> | null = null;
  private _flexDialogRef: MatDialogRef<any> | null = null;

  modalWithParams(pDataModal: PedidoVentaDTO, pClose2Save = false, pIdentificador = null, pSaveInField = false, openQuickTransitionAfterSave = null) {

    const dialogRef: MatDialogRef<any> = this.dialog.open(FormComponent, {
      // width: '720px',
      maxHeight: '100vh',
      maxWidth: '98vw',
      disableClose: true,
      data: { data: pDataModal, close2Save: pClose2Save, identificador: pIdentificador, saveInField: pSaveInField, openQuickTransitionAfterSave: openQuickTransitionAfterSave },
    });
    return dialogRef.afterClosed();
  }

  modalSuccess(pHtmlToPrint: string) {
    const dialogRef: MatDialogRef<any> = this.dialog.open(SuccessComponent, {
      maxHeight: '100vh',
      maxWidth: '98vw',
      data: { data: pHtmlToPrint },
    });
    return dialogRef.afterClosed();
  }

  modalFlex(pTemplate: string){
    // Close any previously opened flex panel
    try{ if (this._flexDialogRef) { this._flexDialogRef.close(); } }catch(e){ }

    this._flexDialogRef = this.dialog.open(DocumentTemplateFormComponent, {
      hasBackdrop: false,
      disableClose: false,
      panelClass: 'flex-right-panel',
      data: { template: pTemplate},
    });

    this._flexDialogRef.afterClosed().subscribe(() => { this._flexDialogRef = null; });
    return this._flexDialogRef.afterClosed();
  }

  fieldModalFlex(pTemplate: string, pTipo?:string){
    // Close any previously opened Field dialog so only one is displayed
    try{ if (this._fieldDialogRef) { this._fieldDialogRef.close(); } }catch(e){ }

    this._fieldDialogRef = this.dialog.open(DocumentTemplateFieldDetailComponent, {
      hasBackdrop: false,
      disableClose: false,
      panelClass: 'flex-right-panel',
      data: { template: pTemplate, tipo: pTipo},
    });

    try{
      this._document.body.classList.add('flex-panel-open');
    }catch(e){  }

    this._fieldDialogRef.afterClosed().subscribe(() => {
      try{
        this._document.body.classList.remove('flex-panel-open');
      }catch(e){ }
      this._fieldDialogRef = null;
    });

    return this._fieldDialogRef.afterClosed();
  }


  fieldEditModalFlex(pTemplate: string){
    const dialogRef: MatDialogRef<any> = this.dialog.open(DocumentTemplateFieldFormComponent, {
      maxHeight: '90vh',
      data: { template: pTemplate},
    });
    return dialogRef.afterClosed();
  }

  fieldAddModalFlex(ptemplate: string, pCampo?:DocumentoPlantillaCaracteristicaDTO){
    const dialogRef: MatDialogRef<any> = this.dialog.open(DocumentTemplateFieldFormComponent, {
      maxHeight: '90vh',
      data: { template: ptemplate , campo: pCampo },
    });
    return dialogRef.afterClosed();
  }

  propertyAddModalFlex(pCampo: string, ptipo:PropiedadValorDefinidoDTO , pPropiedad?:PropiedadCampoDTO){
    const dialogRef: MatDialogRef<any> = this.dialog.open(PropertyModalComponent, {
      maxHeight: '90vh',
      data: { template: pCampo , propiedad: pPropiedad, tipo: ptipo },
    });
    return dialogRef.afterClosed();
  }

  modalVoucher(pKey: string, pCatalog: string) {
    const dialogRef: MatDialogRef<any> = this.dialog.open(ManualFormComponent, {
      maxHeight: '90vh',
      data: { key: pKey, catalogId: pCatalog },
    });
    return dialogRef.afterClosed();
  }

  modalUserChangePassOther(pUsuario: UsuarioDTO) {
    const dialogRef: MatDialogRef<any> = this.dialog.open(dfaComponent, {
      disableClose: false,
      data: { key: pUsuario },
    });
    return dialogRef.afterClosed();
  }

  modalUserChangePass() {
    const dialogRef: MatDialogRef<any> = this.dialog.open(SettingsSecurityComponent, {
      maxHeight: '90vh',
    });
    return dialogRef.afterClosed();
  }

  modalUser(pKey: string) {
    const dialogRef: MatDialogRef<any> = this.dialog.open(ContactsDetailsComponent, {
      maxHeight: '90vh',
      data: { key: pKey },
    });
    return dialogRef.afterClosed();
  }

  modalTransfer(pDocument: string, pState: string, pTemplate: string, pServer: string) {
    const dialogRef: MatDialogRef<any> = this.dialog.open(TransferFormComponent, {
      disableClose: false,
      data: { document: pDocument, state: pState, template: pTemplate, server: pServer },
    });
    return dialogRef.afterClosed();
  }

  modalTrace(pDocument: string, pTemplate: string, pServer: string, pDocumentName: string, pDocumentState: string, pState: string) {
    const dialogRef: MatDialogRef<any> = this.dialog.open(TrazabilityComponent, {
      data: {
        document: pDocument, template: pTemplate, server: pServer,
        documentName: pDocumentName, documentState: pDocumentState, state: pState,
      },
    });
    return dialogRef.afterClosed();
  }
}