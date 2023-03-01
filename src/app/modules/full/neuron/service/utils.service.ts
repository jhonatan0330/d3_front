import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DetallePedidoVentaDTO, PedidoVentaDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { CatalogComponent } from 'app/modules/full/neuron/form/catalog/catalog.component';
import { ProductComponent } from 'app/modules/full/neuron/form/controls/detalle/product/product.component';
import { FormComponent } from 'app/modules/full/neuron/form/form.component';
import { TransferFormComponent } from 'app/notification/transfer-form/transfer-form.component';

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

  modalProduct( pDataModal: DetallePedidoVentaDTO, allowEdit) {
    const dialogRef: MatDialogRef<any> = this.dialog.open(ProductComponent, {
      width: '720px',
      maxHeight: '90vh',
      disableClose: true,
      data: { data: pDataModal, allowEdit: allowEdit},
    });
    return dialogRef.afterClosed();
  }

  modalCatalog( pDataModal: PedidoVentaDTO) {
    const dialogRef: MatDialogRef<any> = this.dialog.open(CatalogComponent, {
      width: '720px',
      maxHeight: '90vh',
      disableClose: true,
      data: { data: pDataModal},
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
}
