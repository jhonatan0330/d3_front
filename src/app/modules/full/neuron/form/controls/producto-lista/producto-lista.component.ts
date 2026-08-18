import { Component, OnInit, ChangeDetectionStrategy, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from 'app/modules/full/neuron/service/api.service';
import { UtilsService } from 'app/modules/full/neuron/service/utils.service';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import Swal from 'sweetalert2';
import { BaseComponent } from '../base/base.component';
import { PedidoVentaCaracteristicaFilterDTO, ProductoDTO, UsuarioRolProductoDTO } from '../../../model/sw42.domain';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { DecimalPipe, TitleCasePipe } from '@angular/common';

@Component({
    selector: 'app-producto-lista',
    templateUrl: './producto-lista.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ MatFormField,MatLabel,MatInput,FormsModule,ReactiveFormsModule,MatSuffix,MatIcon,MatTable,MatColumnDef,MatHeaderCellDef,MatHeaderCell,MatCellDef,MatCell,MatHeaderRowDef,MatHeaderRow,MatRowDef,MatRow,DecimalPipe,TitleCasePipe]
})
export class ProductoListaComponent extends BaseComponent implements OnInit {
  private api = inject(ApiService);
  private utils = inject(UtilsService);


  fControl = new FormControl('') ; // Texto que digita el usuario para filtrar

  productosDisponibles: ProductoDTO[];
  productosFiltrados: ProductoDTO[];
  usuarioRol: UsuarioRolProductoDTO;
  promoForm = new FormGroup({
    nombre: new FormControl(''),
    cantidad: new FormControl(0)
  });
  displayedColumns: string[] = [
    'producto', 'personalizado', 'promocion'
  ];

  ngOnInit(): void {

    super.ngOnInit();
			if (!this.data.productosExclusivos) {
        this.data.productosExclusivos = [];
      } 

			if(!this.data.documento || !this.isEmpty(this.obtenerValor(PlantillaHelper.PERMISO_CAMPO_MODIFICABLE))){
        this.displayedColumns.push('retirar')
				/*
        listaExclusividades.updateFunction = function ():void{
					var vc:UsuarioRolProductoForm = new UsuarioRolProductoForm();
					vc.usuarioRolProducto = listaExclusividades.selectedItem as UsuarioRolProductoVO;
					vc.usuarioRolProductoBase.documento = MVCConstant.NULL_SPACE;
					vc.usuarioRolProductoBase.producto = listaExclusividades.selectedItem.llaveTabla;
					vc.usuarioRolProductoBase.productoNombre = listaExclusividades.selectedItem.nombre;
					vc.usuarioRolProductoBase.cantidadPromocion  = NaN;
					vc.usuarioRolProductoBase.cantidadPromocionBase  = listaExclusividades.selectedItem.cantidadPromocionBase;
					WindowManager.getInstance().showPopUpWindow(vc);
					vc.submitFunction = function():void{
						WindowManager.getInstance().closePopUpWindow();
						avisarModificacion();
					}
					focusUpdate(null);
				}

				listaExclusividades.inactivateFunction = function ():void{
					listaExclusividades.dataProvider.removeItemAt(listaExclusividades.selectedIndex);
					listaExclusividades.dispatchEvent(new ChainEvent("submitComplete",getName()));
					avisarModificacion();
				}*/
			}

  }

  listar():void{
    if (this.fControl.value && this.fControl.value.length === 0) {
      Swal.fire('', 'Selecciona un valor a buscar', 'info')
      return;
    }
    this.isLoading.set(true);
    const nFilter:PedidoVentaCaracteristicaFilterDTO = this.transformPVCtoFilter(this.data);
    nFilter.filtroParametro = this.fControl.value!;
    this.fControl.setValue('');
    this.api.consultarDatosBase(nFilter, this.urlServer)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (_value: PedidoVentaCaracteristicaFilterDTO) => {
        this.isLoading.set(false);
        this.productosDisponibles = Object.assign([], _value.campoDTO.productos);
          if (this.productosDisponibles.length === 0) {
            Swal.fire ('Sin resultados', 'No encontramos resultados por el filtro' + this.fControl.value,  'info');
          } else {
            this.productosFiltrados = this.productosDisponibles;
          }
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  mostrarFormularioAgregar(producto:ProductoDTO):void{
    if (!this.isEnabled) {
      return;
    }

    this.promoForm.reset({ nombre: '', cantidad: 0 });
    this.usuarioRol = new UsuarioRolProductoDTO();
    this.usuarioRol.producto = producto.llaveTabla;
    this.usuarioRol.productoNombre = producto.nombre;
    if (producto.cantidadPromocionBase === 0){
      this.usuarioRol.cantidadPromocionBase  = 30;
    }else{
      this.usuarioRol.cantidadPromocionBase  = producto.cantidadPromocionBase;
    }
  }

  addProductoExclusivo(){
    // vc.usuarioRolProducto.estado = MVCConstant.ESTADO_ACTIVO;
    const promoData = this.promoForm.value;
    this.usuarioRol.estado = 'A';
    this.usuarioRol.nombre = promoData.nombre!;
    this.usuarioRol.cantidadPromocion = promoData.cantidad!;
    this.data.productosExclusivos.push(this.usuarioRol);
    this.usuarioRol = undefined!;
    this.productosDisponibles = undefined!;
    this.productosFiltrados = undefined!;
    this.avisarModificacion();
  }

  removeProductoExclusivo(item: UsuarioRolProductoDTO) {
    const index = this.data.productosExclusivos.indexOf(item, 0);
    if (index > -1) {
      this.data.productosExclusivos.splice(index, 1);
    }
    this.data.productosExclusivos = Object.assign([], this.data.productosExclusivos); // Para que se refresque la lista
    this.avisarModificacion();
  }

}
