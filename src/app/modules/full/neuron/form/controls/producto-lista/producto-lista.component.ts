import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ApiService } from 'app/modules/full/neuron/service/api.service';
import { UtilsService } from 'app/modules/full/neuron/service/utils.service';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import Swal from 'sweetalert2';
import { BaseComponent } from '../base/base.component';
import { ProductoDTO, UsuarioRolProductoDTO } from 'app/inventory/inventory.types';
import { PedidoVentaCaracteristicaFilterDTO } from '../../../model/sw42.domain';

@Component({
  selector: 'app-producto-lista',
  templateUrl: './producto-lista.component.html'
})
export class ProductoListaComponent extends BaseComponent implements OnInit {

  fControl = new FormControl('') ; // Texto que digita el usuario para filtrar

  productosDisponibles: ProductoDTO[];
  productosFiltrados: ProductoDTO[];
  usuarioRol: UsuarioRolProductoDTO;
  promoForm: FormGroup;
  displayedColumns: string[] = [
    'producto', 'personalizado', 'promocion'
  ];

  constructor(private api: ApiService, private utils: UtilsService) {
    super();
  }

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
    this.isLoading = true;
    const nFilter:PedidoVentaCaracteristicaFilterDTO = this.transformPVCtoFilter(this.data);
    nFilter.filtroParametro = this.fControl.value;
    this.fControl.setValue('');
    this.api.consultarDatosBase(nFilter, this.urlServer).subscribe({
      next: (_value: PedidoVentaCaracteristicaFilterDTO) => {
        this.isLoading = false;
        this.productosDisponibles = Object.assign([], _value.campoDTO.productos);
          if (this.productosDisponibles.length === 0) {
            Swal.fire ('Sin resultados', 'No encontramos resultados por el filtro' + this.fControl.value,  'info');
          } else {
            this.productosFiltrados = this.productosDisponibles;
          }
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  mostrarFormularioAgregar(producto:ProductoDTO):void{
    if (!this.isEnabled) {
      return;
    }

    this.promoForm = new FormGroup({
      nombre: new FormControl(''),
      cantidad: new FormControl(0)
    });
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
    this.usuarioRol.nombre = promoData.nombre;
    this.usuarioRol.cantidadPromocion = promoData.cantidad;
    this.data.productosExclusivos.push(this.usuarioRol);
    this.usuarioRol = undefined;
    this.productosDisponibles = undefined;
    this.productosFiltrados = undefined;
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
