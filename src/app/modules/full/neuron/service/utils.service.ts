import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DetallePedidoVentaDTO, PedidoVentaDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { FormComponent } from 'app/modules/full/neuron/form/form.component';
import { TransferFormComponent } from 'app/notification/transfer-form/transfer-form.component';
import { TrazabilityComponent } from 'app/document-transition/trazability/trazability.component';
import { ProductComponent } from '../form/controls/product/product.component';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  
  constructor(public dialog: MatDialog) {}

  modalWithParams( pDataModal: PedidoVentaDTO, pClose2Save = false, pIdentificador = null ) {
    const dialogRef: MatDialogRef<any> = this.dialog.open(FormComponent, {
      // width: '720px',
      maxHeight: '90vh',
      // maxWidth: '95vw',
      disableClose: true,
      data: { data: pDataModal , close2Save: pClose2Save, identificador:  pIdentificador},
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

  modalTrace(document: string, template: string, server: string, documentName: string, documentState: string){
    const dialogRef: MatDialogRef<any> = this.dialog.open(TrazabilityComponent, {
      maxHeight: '90vh',
      maxWidth: '99vh',
      disableClose: false,
      data: { document: document, template: template, server: server, documentName: documentName, documentState: documentState},
    });
    return dialogRef.afterClosed();
  }

  public modalProduct( pDataModal: DetallePedidoVentaDTO, allowEdit) {
    const dialogRef: MatDialogRef<any> = this.dialog.open(ProductComponent, {
      width: '720px',
      maxHeight: '90vh',
      disableClose: true,
      data: { data: pDataModal, allowEdit: allowEdit},
    });
    return dialogRef.afterClosed();
  }

}
