import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { ProductoDTO, ProductoInventarioDTO } from '../inventory.types';
import { InventoryService } from '../inventory.service';

@Component({
  selector: 'inventory-catalog',
  templateUrl: './catalog.component.html'
})
export class CatalogComponent implements OnInit {

  product : ProductoDTO;
  imageControl: FormControl = new FormControl('');
  descripcionControl: FormControl = new FormControl('');
  baseControl: FormControl = new FormControl('');
  options: ProductoDTO[] = [];

  isEditable = false; // activa el modo de edicion del producto
  isLoading = false; // ayuda a mostrar la barra de progreso en las busqueas

  inventoryColumns: String[] = ['bodega', 'minimo', 'maximo', 'actual'];

  inventario: ProductoInventarioDTO[] =[];

  server: string;
  // composicion: Pro[] =[];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<CatalogComponent>,
    private api: InventoryService
    ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.api.consultarProducto(this.data.data.llaveTabla, this.server).subscribe({
      next: (producto: ProductoDTO) => {
        if(!producto){
          Swal.fire('No product', 'No hemos identificado el producto', 'info');
          return;
        }
        this.product = producto;
        
        if( this.product.productoBase) {
          
          const p:ProductoDTO = new ProductoDTO();
          p.nombre = this.product.baseNombre;
          p.llaveTabla = this.product.productoBase;
          this.options.push(p);

          this.baseControl.setValue(p);
        }
        this.descripcionControl.setValue(this.product.descripcion);
        this.imageControl.setValue(this.product.imagen);
        this.isLoading = false;
      },
      error: () => {
        this.dialogRef.close();
      }
    });
  }

  update(): void {

    this.product.descripcion = this.descripcionControl.value;
    this.product.imagen = this.imageControl.value;
    if(!this.baseControl.value){
      this.product.productoBase = null;
    } else {
      if (this.baseControl.value.llaveTabla){
        this.product.productoBase = this.baseControl.value;
      }else{
        this.product.productoBase = null;
      }
    }
    this.isLoading = true;
    this.api.actualizarProducto(this.product, this.server).subscribe({
      next: () => {
        this.dialogRef.close();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  autoCompleteDisplay(item: ProductoDTO): string {
    if (!item) {
      return '';
    }
    return item.nombre;
  }

  gestionarKeyUpTexto() {
    if (this.isEditable) {
      this.isLoading = true;
      this.api.consultarProductos2Filter(this.baseControl.value, this.server).subscribe({
        next: (productos: ProductoDTO[]) => {
          this.options = productos;
        },
        error: () => {
          this.isLoading = false;
        }
      });
    }
  }


  consultarInventarios() {
    this.isLoading = true;
    this.api.consultarInventario(this.product.llaveTabla, this.server).subscribe({
      next: (_inv: ProductoInventarioDTO[]) => {
        this.inventario = _inv;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
  
  toogleEdit() {
    this.isEditable = true;
    this.inventoryColumns.push('acciones');
  }

}
