import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PedidoVentaDTO, PropiedadCampoDTO } from 'app/modules/full/neuron/model/sw42.domain';
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
import { PropiedadDTO } from 'app/shared/shared.domain';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {

  constructor(public dialog: MatDialog) { }

  modalWithParams(pDataModal: PedidoVentaDTO, pClose2Save = false, pIdentificador = null, pSaveInField = false) {

    const dialogRef: MatDialogRef<any> = this.dialog.open(FormComponent, {
      // width: '720px',
      maxHeight: '100vh',
      maxWidth: '98vw',
      disableClose: true,
      data: { data: pDataModal, close2Save: pClose2Save, identificador: pIdentificador, saveInField: pSaveInField },
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
    const dialogRef: MatDialogRef<any> = this.dialog.open(FlexComponent, {
      maxHeight: '90vh',
      data: { template: pTemplate},
    });
    return dialogRef.afterClosed();
  }

  fieldModalFlex(pTemplate: string, pTipo?:string){
    const dialogRef: MatDialogRef<any> = this.dialog.open(FieldComponent, {
      maxHeight: '90vh',
      data: { template: pTemplate, tipo: pTipo},
    });
    return dialogRef.afterClosed();
  }

  fieldEditModalFlex(pTemplate: string){
    const dialogRef: MatDialogRef<any> = this.dialog.open(AddFieldComponent, {
      maxHeight: '90vh',
      data: { template: pTemplate},
    });
    return dialogRef.afterClosed();
  }

  fieldAddModalFlex(pCampo: string, pPropiedad?:PropiedadCampoDTO){
    const dialogRef: MatDialogRef<any> = this.dialog.open(AddFieldComponent, {
      maxHeight: '90vh',
      data: { template: pCampo , propiedad: pPropiedad },
    });
    return dialogRef.afterClosed();
  }

  propertyAddModalFlex(pCampo: string, pPropiedad?:PropiedadCampoDTO){
    const dialogRef: MatDialogRef<any> = this.dialog.open(AddPropertyComponent, {
      maxHeight: '90vh',
      data: { template: pCampo , propiedad: pPropiedad },
    });
    return dialogRef.afterClosed();
  }

}
