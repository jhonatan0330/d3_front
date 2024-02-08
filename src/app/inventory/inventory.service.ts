import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Observable } from 'rxjs';
import { InventoryPagination, ProductoDTO, ProductoInventarioDTO } from './inventory.types';
import { HttpClient } from '@angular/common/http';
import { LocalStoreService } from 'app/shared/local-store.service';
import { tap } from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  private _pagination: BehaviorSubject<InventoryPagination | null> = new BehaviorSubject(null);
  private _products: BehaviorSubject<ProductoDTO[] | null> = new BehaviorSubject(null);

  constructor(
    public dialog: MatDialog,
    private http: HttpClient,
    private ls: LocalStoreService
  ) {
  }

  /**
 * Getter for pagination
 */
  get pagination$(): Observable<InventoryPagination> {
    return this._pagination.asObservable();
  }

  /**
 * Getter for products
 */
  get products$(): Observable<ProductoDTO[]> {
    return this._products.asObservable();
  }

    
 

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

  consultarInventario(productoId: String, _server: string): Observable<ProductoInventarioDTO[]> {
    return this.http.get<ProductoInventarioDTO[]>(
      this.ls.getUrlAccess('/document/getInventory/' + productoId, _server)
    );
  }
}
