import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PedidoVentaDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { FormComponent } from 'app/modules/full/neuron/form/form.component';
import { TransferFormComponent } from 'app/notification/transfer-form/transfer-form.component';
import { TrazabilityComponent } from 'app/document-transition/trazability/trazability.component';
import { SuccessComponent } from '../form/success/success.component';
import { ManualFormComponent } from 'app/accounting/manual-form/manual-form.component';
import { ContactsDetailsComponent } from 'app/persons/detail_persons/detail_persons';
import { SettingsSecurityComponent } from 'app/authentication/settings/security/security.component';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  
  constructor(public dialog: MatDialog) {}

  modalWithParams( pDataModal: PedidoVentaDTO, pClose2Save = false, pIdentificador = null, pSaveInField = false ) {

    const dialogRef: MatDialogRef<any> = this.dialog.open(FormComponent, {
      // width: '720px',
      maxHeight: '100vh',
      maxWidth: '98vw',
      disableClose: true,
      data: { data: pDataModal , close2Save: pClose2Save, identificador:  pIdentificador, saveInField: pSaveInField},
    });
    return dialogRef.afterClosed();
  }

  modalSuccess( pHtmlToPrint : string) {
    const dialogRef: MatDialogRef<any> = this.dialog.open(SuccessComponent, {
      maxHeight: '100vh',
      maxWidth: '98vw',
      data: { data: pHtmlToPrint},
    });
    return dialogRef.afterClosed();
  }

  modalTransfer(document: string, state: string, template: string, server: string){
    const dialogRef: MatDialogRef<any> = this.dialog.open(TransferFormComponent, {
      maxHeight: '90vh',
      maxWidth: '90vh',
      disableClose: false,
      data: { document: document, state: state, template: template, server: server},
    });
    return dialogRef.afterClosed();
  }

  modalTrace(document: string, template: string, server: string, documentName: string, documentState: string, state: string){
    const dialogRef: MatDialogRef<any> = this.dialog.open(TrazabilityComponent, {
      maxHeight: '90vh',
      maxWidth: '99vh',
      disableClose: false,
      data: { document: document, template: template, server: server, documentName: documentName, documentState: documentState, state: state},
    });
    return dialogRef.afterClosed();
  }

  modalVoucher(_key: string, _catalog:string){
    const dialogRef: MatDialogRef<any> = this.dialog.open(ManualFormComponent, {
      disableClose: true,
      maxHeight: '90vh',
      data: { key:_key, catalogId: _catalog }
    });
    return dialogRef.afterClosed();
  }

  modalUser(_key: string){
    const dialogRef: MatDialogRef<any> = this.dialog.open(ContactsDetailsComponent, {
      maxHeight: '90vh',
      data: { key:_key }
    });
    return dialogRef.afterClosed();
  }

  modalUserChangePass(_key: string){
    const dialogRef: MatDialogRef<any> = this.dialog.open(SettingsSecurityComponent, {
      maxHeight: '90vh',
      data: { key:_key }
    });
    return dialogRef.afterClosed();
  }

  /*
  public modalProduct( pDataModal: DetallePedidoVentaDTO, allowEdit) {
    const dialogRef: MatDialogRef<any> = this.dialog.open(ProductComponent, {
      width: '720px',
      maxHeight: '90vh',
      disableClose: true,
      data: { data: pDataModal, allowEdit: allowEdit},
    });
    return dialogRef.afterClosed();
  }*/

}
