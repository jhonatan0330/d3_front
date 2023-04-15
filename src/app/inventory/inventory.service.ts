import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ProductoDTO, ProductoInventarioDTO, TarifaDTO } from './inventory.types';
import { HttpClient } from '@angular/common/http';
import { LocalStoreService } from 'app/shared/local-store.service';

@Injectable()
export class InventoryService {
  
  constructor(
    public dialog: MatDialog,
    private http: HttpClient,
    private ls: LocalStoreService
  ) {
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
  */
  consultarProducto(productoId: String, _server: string): Observable<ProductoDTO> {
    return this.http.get<ProductoDTO>(
      this.ls.getUrlAccess('/document/getProduct/' + productoId, _server)
    );
  }

  actualizarProducto(producto: ProductoDTO, _server: string): Observable<ProductoDTO> {
    return this.http.post<ProductoDTO>(
      this.ls.getUrlAccess('/document/updateProduct', _server),
      producto
    );
  }

  consultarProductos2Filter(filter: String, _server: string): Observable<ProductoDTO[]> {
    return this.http.get<ProductoDTO[]>(
      this.ls.getUrlAccess('/document/getProducts/' + filter, _server)
    );
  }

  consultarTarifasProducto(productId: String, _server: string): Observable<TarifaDTO[]> {
    return this.http.get<TarifaDTO[]>(
      this.ls.getUrlAccess('/document/getTarifas/' + productId, _server)
    );
  }

  consultarInventario(productoId: String, _server: string): Observable<ProductoInventarioDTO[]> {
    return this.http.get<ProductoInventarioDTO[]>(
      this.ls.getUrlAccess('/document/getInventory/' + productoId, _server)
    );
  }
}
