import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DetallePedidoVentaDTO, PedidoVentaDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { CatalogComponent } from './catalog/catalog.component';
import { ProductComponent } from './product/product.component';

@Injectable()
export class InventoryService {
  
  constructor(
    public dialog: MatDialog
  ) {
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

  modalCatalog( pDataModal: PedidoVentaDTO) {
    const dialogRef: MatDialogRef<any> = this.dialog.open(CatalogComponent, {
      width: '720px',
      maxHeight: '90vh',
      disableClose: true,
      data: { data: pDataModal},
    });
    return dialogRef.afterClosed();
  }

}
