import { Injectable, Inject, DOCUMENT } from '@angular/core';

import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DocumentoPlantillaCaracteristicaDTO, PedidoVentaDTO, PropiedadCampoDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { FormComponent } from 'app/modules/full/neuron/form/form.component';
import { TransferFormComponent } from 'app/notification/transfer-form/transfer-form.component';
import { TrazabilityComponent } from 'app/document-transition/trazability/trazability.component';
import { SuccessComponent } from '../form/success/success.component';
import { ManualFormComponent } from 'app/accounting/manual-form/manual-form.component';
import { ContactsDetailsComponent } from 'app/persons/detail_persons/detail_persons';
import { SettingsSecurityComponent } from 'app/authentication/settings/security/security.component';
import { UsuarioDTO } from 'app/authentication/authentication.domain';
import { FlexComponent } from 'app/configuration-forms/flex/flex';
import { dfaComponent } from 'app/authentication/DFA/dfa';
import { FieldComponent } from 'app/configuration-forms/flex/fieldComponent';
import { AddFieldComponent } from 'app/configuration-forms/flex/addField';
import { AddPropertyComponent } from 'app/configuration-forms/flex/addProperty';
import {  PropiedadValorDefinidoDTO } from 'app/shared/shared.domain';
import { VisorPdfDialogComponent } from 'app/shared/components/visor-pdf-dialog/visor-pdf-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {

  // Keep references to open right-side dialogs to ensure only one instance of each type is open
  private _fieldDialogRef: MatDialogRef<any> | null = null;
  private _flexDialogRef: MatDialogRef<any> | null = null;

  constructor(public dialog: MatDialog, @Inject(DOCUMENT) private _document: any) { }

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

  modalTransfer(document: string, state: string, template: string, server: string) {
    const dialogRef: MatDialogRef<any> = this.dialog.open(TransferFormComponent, {
      maxHeight: '90vh',
      maxWidth: '90vh',
      disableClose: false,
      data: { document: document, state: state, template: template, server: server },
    });
    return dialogRef.afterClosed();
  }

  modalTrace(document: string, template: string, server: string, documentName: string, documentState: string, state: string) {
    const dialogRef: MatDialogRef<any> = this.dialog.open(TrazabilityComponent, {
      maxHeight: '90vh',
      maxWidth: '99vh',
      disableClose: false,
      data: { document: document, template: template, server: server, documentName: documentName, documentState: documentState, state: state },
    });
    return dialogRef.afterClosed();
  }

  modalVoucher(_key: string, _catalog: string) {
    const dialogRef: MatDialogRef<any> = this.dialog.open(ManualFormComponent, {
      disableClose: true,
      maxHeight: '90vh',
      data: { key: _key, catalogId: _catalog }
    });
    return dialogRef.afterClosed();
  }

  modalUser(_key: string) {
    const dialogRef: MatDialogRef<any> = this.dialog.open(ContactsDetailsComponent, {
      maxHeight: '90vh',
      data: { key: _key }
    });
    return dialogRef.afterClosed();
  }

  modalUserChangePassOther(_key: UsuarioDTO) {
    const dialogRef: MatDialogRef<any> = this.dialog.open(dfaComponent, {
      maxHeight: '90vh',
      disableClose: false, // permite cerrar haciendo clic fuera
      data: { key: _key }
    });
    return dialogRef.afterClosed();
  }


  modalUserChangePass() {
    const dialogRef: MatDialogRef<any> = this.dialog.open(SettingsSecurityComponent, {
      maxHeight: '90vh',
    });
    return dialogRef.afterClosed();
  }

  modalFlex(pTemplate: string){
    // Close any previously opened flex panel
    try{ if (this._flexDialogRef) { this._flexDialogRef.close(); } }catch(e){ }

    this._flexDialogRef = this.dialog.open(FlexComponent, {
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

    this._fieldDialogRef = this.dialog.open(FieldComponent, {
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
    const dialogRef: MatDialogRef<any> = this.dialog.open(AddFieldComponent, {
      maxHeight: '90vh',
      data: { template: pTemplate},
    });
    return dialogRef.afterClosed();
  }

  fieldAddModalFlex(ptemplate: string, pCampo?:DocumentoPlantillaCaracteristicaDTO){
    const dialogRef: MatDialogRef<any> = this.dialog.open(AddFieldComponent, {
      maxHeight: '90vh',
      data: { template: ptemplate , campo: pCampo },
    });
    return dialogRef.afterClosed();
  }

  propertyAddModalFlex(pCampo: string, ptipo:PropiedadValorDefinidoDTO , pPropiedad?:PropiedadCampoDTO){
    const dialogRef: MatDialogRef<any> = this.dialog.open(AddPropertyComponent, {
      maxHeight: '90vh',
      data: { template: pCampo , propiedad: pPropiedad, tipo: ptipo },
    });
    return dialogRef.afterClosed();
  }

  openPDF() {
    const dialogRef: MatDialogRef<any> = this.dialog.open(VisorPdfDialogComponent, {
      width: '80%',
      height: '90%',
      data: {
        params: { id: 123 }
      }
    });
    return dialogRef.afterClosed();
  }
}
