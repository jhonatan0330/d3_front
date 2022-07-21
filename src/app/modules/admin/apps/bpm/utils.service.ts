import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DetallePedidoVentaDTO, PedidoVentaDTO } from 'app/model/sw42.domain';

import { ProductComponent } from 'app/modules/admin/apps/bpm/form/controls/detalle/product/product.component';
import { FormComponent } from 'app/modules/admin/apps/bpm/form/form.component';
import { CatalogComponent } from './form/catalog/catalog.component';


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

  modalProduct( pDataModal: DetallePedidoVentaDTO) {
    const dialogRef: MatDialogRef<any> = this.dialog.open(ProductComponent, {
      width: '720px',
      maxHeight: '90vh',
      disableClose: true,
      data: { data: pDataModal},
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
/*
  modalChangePwd( ) {
    const dialogRef: MatDialogRef<any> = this.dialog.open(ChangePwdComponent, {
      //width: '720px',
      maxHeight: '90vh',
      disableClose: false,
    });
    return dialogRef.afterClosed();
  }

  modalChangePicture( ) {
    const dialogRef: MatDialogRef<any> = this.dialog.open(ChangePictureComponent, {
      //width: '720px',
      maxHeight: '90vh',
      disableClose: false,
    });
    return dialogRef.afterClosed();
  }

  modalFAQ( id: String){
    const dialogRef: MatDialogRef<any> = this.dialog.open(HelpFaqComponent, {
      //width: '720px',
      maxHeight: '90vh',
      disableClose: false,
    });
    return dialogRef.afterClosed();
  }*/
}
