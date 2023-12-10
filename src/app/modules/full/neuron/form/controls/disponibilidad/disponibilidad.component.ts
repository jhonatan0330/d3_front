import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DocumentoPlantillaCaracteristicaEnum } from 'app/modules/full/neuron/model/sw42.enum';
import { ApiService } from 'app/modules/full/neuron/service/api.service';
import { TemplateService } from 'app/modules/full/neuron/service/template.service';
import { UtilsService } from 'app/modules/full/neuron/service/utils.service';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import { DetallePedidoVentaDTO, PedidoVentaCaracteristicaDTO, PedidoVentaCaracteristicaFilterDTO } from '../../../model/sw42.domain';
import { BaseComponent } from '../base/base.component';
import { Estructura } from './estructura';
import { Puesto } from './puesto';
import { ProductoDTO } from 'app/inventory/inventory.types';
import { LocalStoreService } from 'app/shared/local-store.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ProductComponent } from '../product/product.component';

@Component({
  selector: 'app-disponibilidad',
  templateUrl: './disponibilidad.component.html'
})
export class DisponibilidadComponent extends BaseComponent implements OnInit {
  @ViewChild('canvas', { static: true }) myCanvas: ElementRef<HTMLCanvasElement>;
  ctx: CanvasRenderingContext2D;
  estructura: Estructura;
  multiple = false;

  fControl = new FormControl('');

  constructor(
    private api: ApiService,
    private ls: LocalStoreService,
    private template: TemplateService,
    private utils: UtilsService,
    private dialog: MatDialog
  ) {
    super();
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.multiple = !this.isEmpty(this.obtenerValor(PlantillaHelper.MULTIPLE_SELECCION));
    this.ctx = this.myCanvas.nativeElement.getContext('2d');
    this.fControl.setValue(this.data.valorText);
  }

  mostrarPlano(): void {
    if (!this.estructura) {
      this.procesarCampo(this.transformPVCtoFilter(this.data));
      return;
    }
    this.estructura.draw();
  }

  procesarCampo(campoFiltro: PedidoVentaCaracteristicaFilterDTO) {
    if (this.relatedFields) {
      if (
        !this.data.dependientes ||
        this.data.dependientes.length !== this.relatedFields.length
      ) {
        return;
      }
      for (let i = 0; i < this.relatedFields.length; i++) {
        if (
          !this.data.dependientes[i].valorOpcion
          && this.data.dependientes[i].campoDTO.formato === DocumentoPlantillaCaracteristicaEnum.PROCESO
          && !PlantillaHelper.buscarPropiedad(this.data.dependientes[i].campoDTO.propiedades, PlantillaHelper.PERMISO_CAMPO_OPCIONAL)
        ) {
          return;
        }
      }
      const filtro: PedidoVentaCaracteristicaFilterDTO = new PedidoVentaCaracteristicaFilterDTO();
      filtro.campoDTO = this.structure;
      filtro.campo = this.structure.llaveTabla;
      filtro.documento = campoFiltro.documento;
      filtro.dependientes = this.data.dependientes;

      this.isLoading = true;
      this.api.consultarDatosBase(filtro, this.urlServer).subscribe({
        next: (_value: PedidoVentaCaracteristicaFilterDTO) => {
          this.isLoading = false;
          this.consultaExitosaDatosBase(_value);
        },
        error: () => {
          this.isLoading = false;
        },
      });
    }
  }

  consultaExitosaDatosBase(pCampo: PedidoVentaCaracteristicaFilterDTO) {
    this.estructura = new Estructura(this.ctx, pCampo.campoDTO, this.multiple, this.template, this.utils, this.ls);
    this.estructura.isEnabled = this.isEnabled;
    this.structure.productos = pCampo.campoDTO.productos;
    this.mostrarPlano();
    // Solo al crear la estructura selecciono campos de resto lo hace el componente
    this.estructura.selectFromText(this.data.valorText, this.data.detalles);
    this.estructura.navItem$.subscribe((puesto) => {
      this.ajustarData(puesto);
    });
  }

  ajustarData(puesto: Puesto) {
    this.data.expedientes = this.estructura.reload();
    this.data.valorNumero = this.estructura.cantidad;
    this.data.valorText = this.estructura.seleccionados;
    this.fControl.setValue(this.data.valorText);
    if (puesto && this.structure.productos && this.structure.productos.length === 1) {
      if (puesto.selected) {
        let formDetailLocation = puesto.detalle;
        if (!formDetailLocation) { formDetailLocation = this.addLocation(puesto, this.structure.productos[0]); }
        if (formDetailLocation) {
          
          const dialogRef: MatDialogRef<any> = this.dialog.open(ProductComponent, {
            width: '720px',
            maxHeight: '90vh',
            disableClose: true,
            data: { data: formDetailLocation, allowEdit: this.isEnabled},
          });
          dialogRef.afterClosed().subscribe((resp) => {
            // Aqui es donde se remueve el item
            if (!resp) {
              this.removeLocation(puesto);
              puesto.onClick();
              //Como llamo a puesto no pasa por el observer de estructura
              this.ajustarData(puesto);
            }
          });
        }
      } 
    }

    this.avisarModificacion();
  }

  addLocation(puesto: Puesto, producto: ProductoDTO): DetallePedidoVentaDTO {
    if (!producto || !puesto) { return; }

    const copyDetalle: DetallePedidoVentaDTO = new DetallePedidoVentaDTO();
    copyDetalle.productoCodigo = producto.detallePlantilla.productoCodigo;
    copyDetalle.producto = producto.detallePlantilla.producto;
    copyDetalle.cantidad = producto.detallePlantilla.cantidad;
    copyDetalle.nombre = puesto.nombre;
    copyDetalle.productoImagen = producto.detallePlantilla.productoImagen;
    copyDetalle.productoDocumento = producto.detallePlantilla.productoDocumento;
    copyDetalle.valorSubtotal = producto.detallePlantilla.valorSubtotal;
    copyDetalle.valorUnitario = producto.detallePlantilla.valorUnitario;
    copyDetalle.valorTotal = producto.detallePlantilla.valorTotal;
    copyDetalle.valorMinimo = producto.detallePlantilla.valorMinimo;
    copyDetalle.valorMaximo = producto.detallePlantilla.valorMaximo;
    copyDetalle.tarifas = producto.detallePlantilla.tarifas;
    if (producto.detallePlantilla.caracteristicas) {
      copyDetalle.caracteristicas = [];
      for (
        let i = 0;
        i < producto.detallePlantilla.caracteristicas.length;
        i++
      ) {
        const campoDetalle = producto.detallePlantilla.caracteristicas[i];
        const uc: PedidoVentaCaracteristicaDTO = new PedidoVentaCaracteristicaDTO();
        uc.campo = campoDetalle.campo;
        uc.campoDTO = campoDetalle.campoDTO;
        uc.valorOpcion = campoDetalle.valorOpcion; // sin esto carga el producto del formulario
        uc.principal = campoDetalle.principal;
        uc.valorNumero = campoDetalle.valorNumero;
        uc.valorText = campoDetalle.valorText;
        copyDetalle.caracteristicas.push(uc);
      }
    }
    copyDetalle.cantidadPromocion =
      producto.detallePlantilla.cantidadPromocion;
    copyDetalle.cantidadPromocionBase =
      producto.detallePlantilla.cantidadPromocionBase;
    copyDetalle.propiedades = producto.detallePlantilla.propiedades;

    if (!this.data.detalles) {
      this.data.detalles = [];
    }
    // copyDetalle.productoCodigo = producto.codigo;
    this.data.detalles.unshift(copyDetalle);
    this.data.detalles = Object.assign([], this.data.detalles); // Para que se refresque la lista
    puesto.detalle = copyDetalle;
    return copyDetalle;
  }

  getLocation(location: Puesto): number {
    if (!this.data.detalles) { return -1; }
    for (let i = 0; i < this.data.detalles.length; i++) {
      const element = this.data.detalles[i];
      if (element.nombre === location.nombre) {
        return i;
      }
    }
    return -1;
  }

  removeLocation(location: Puesto) {
    const index = this.getLocation(location);
    if (index !== -1) {
      this.data.detalles.splice(index, 1);
      this.data.detalles = Object.assign([], this.data.detalles); // Para que se refresque la lista
    }
    location.detalle = null;
  }

}
