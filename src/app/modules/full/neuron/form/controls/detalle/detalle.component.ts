import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  DetallePedidoVentaDTO,
  DocumentoPlantillaDTO,
  PedidoVentaCaracteristicaDTO,
  PedidoVentaCaracteristicaFilterDTO,
  PedidoVentaDTO,
  ProductoDTO,
  RelacionInternaDTO,
  RelacionInternaFilterDTO
} from 'app/modules/full/neuron/model/sw42.domain';
import { ApiService } from 'app/modules/full/neuron/service/api.service';
import { TemplateService } from 'app/modules/full/neuron/service/template.service';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import Swal from 'sweetalert2';
import { BaseComponent } from '../base/base.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ProductComponent } from '../product/product.component';
import { DocumentoPlantillaCaracteristicaEnum, StatesEnum } from '../../../model/sw42.enum';
import { UtilsService } from '../../../service/utils.service';

@Component({
    selector: 'app-detalle',
    templateUrl: './detalle.component.html',
    styleUrls: ['./detalle.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DetalleComponent extends BaseComponent implements OnInit, AfterViewInit {
  unicoProducto = false;
  fControl = new FormControl(''); // Texto que digita el usuario para filtrar
  categories: DocumentoPlantillaDTO[];
  isShowCategories = false;
  isShowProducts = false;
  autoload = false; // Indica que la fuente de datos se va a cargar en memoria
  titleCantity = 'Cantidad';
  busquedaSinTexto = false;
  errorToFilter = null;
  renderVisible = false;

  productosDisponibles: ProductoDTO[];
  productosFiltrados: ProductoDTO[];
  columns: number = 2;
  displayedColumns: string[] = [
    'retirar',
    'imagen',
    'nombre',
    'unidad',
    'cantidad',
    'total'
  ];

  constructor(
    private templateService: TemplateService,
    private api: ApiService,
    private cd: ChangeDetectorRef,
    private utilsService: UtilsService,
    private dialog: MatDialog
  ) {
    super();
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.unicoProducto = !this.isEmpty(
      this.obtenerValor(PlantillaHelper.UNICO_PRODUCTO)
    );
    this.autoload = !this.isEmpty(this.obtenerValor(PlantillaHelper.AUTOLOAD));
    this.renderVisible = !this.isEmpty(this.obtenerValor(PlantillaHelper.PERMISO_CAMPO_RENDER));
    this.busquedaSinTexto = !this.isEmpty(this.obtenerValor(PlantillaHelper.BUSQUEDA_SIN_TEXTO));
    if (!this.isEnabled) {
      const index = this.displayedColumns.indexOf('retirar', 0);
      if (index > -1) {
        this.displayedColumns.splice(index, 1);
      }
    }
    const propTitleCantity = this.obtenerValor(PlantillaHelper.DETALLE_OCULTAR_UNIDADES_NOMBRE_CANTIDAD);
    if (!this.isEmpty(propTitleCantity)) {
      this.titleCantity = propTitleCantity;
      const index = this.displayedColumns.indexOf('unidad', 0);
      if (index > -1) {
        this.displayedColumns.splice(index, 1);
      }
    }
    this.iniciar();
  }

  ngAfterViewInit() {
    this.cd.detectChanges();
  }

  iniciar() {
    this.productosDisponibles = this.structure.productos;
    // Consulto por primera vez los productos en el formulario
    if (this.autoload && !this.productosDisponibles && !this.relatedFields) {
      this.listarProductosAsincronos();
      return;
    }
    // Si es valor unico coloco el texto del producto
    if (this.unicoProducto && this.data.detalles) {
      this.fControl.setValue(this.data.valorText);
    } else {
      this.showCategories();
    }
    if (this.isEnabled) {
      this.fControl.valueChanges.subscribe((value) => this.filterProducts());
    }
  }

  showCategories() {
    if (!this.isEnabled) { return; }
    if (!this.productosDisponibles) { return; }
    if (!this.categories) {
      this.categories = [];
      const map = new Map();
      for (const item of this.productosDisponibles) {
        if (!map.has(item.categoria)) {
          map.set(item.categoria, true);    // set any value to Map
          const dp: DocumentoPlantillaDTO = this.templateService.getTemplate(item.categoria, null);
          if (dp) { this.categories.push(dp); }
        }
      }
    }
    if (this.autoload && this.categories) {
      this.isShowCategories = true;
      this.isShowProducts = false;
    } else {
      this.showProducts();
    }
  }

  selectCategory(pCategory: DocumentoPlantillaDTO) {
    if (pCategory) {
      this.productosFiltrados = this.productosDisponibles.filter(
        (doc) =>
          doc.categoria === pCategory.llaveTabla
      );
    } else {
      this.productosFiltrados = this.productosDisponibles;
    }
    this.showProducts();
  }

  filterProducts() {
    if (this.relatedFields) { return; }
    let valorFiltro: string = this.fControl.value;
    if (valorFiltro) {
      valorFiltro = valorFiltro.toUpperCase();
      if (this.unicoProducto && this.data.detalles && this.data.detalles.length === 1) {
        if (valorFiltro !== (this.data.detalles[0].productoCodigo + ' - ' + this.data.detalles[0].nombre)) {
          this.data.detalles = [];
        }
      }
      if (this.productosDisponibles && this.productosDisponibles.length !== 0) {
        this.productosFiltrados = this.productosDisponibles.filter(
          (item) =>
          (item && ((item.codigo && item.codigo.indexOf(valorFiltro) !== -1)
            || (item.nombre && item.nombre.indexOf(valorFiltro) !== -1)
            || (item.filtros && item.filtros.indexOf(valorFiltro) !== -1)))
        );
      } else {
        this.productosFiltrados = [];
      }

      this.showProducts();
    } else {
      this.showCategories();
    }
  }

  showProducts() {
    if (!this.isEnabled) { return; }
    if (this.unicoProducto && this.data.detalles && this.data.detalles.length !== 0) {
      this.isShowProducts = false;
    } else {
      this.isShowProducts = true;
    }
    this.isShowCategories = false;
  }

  searchQuicly() {
    if (this.isLoading || !this.isEnabled) { return; }
    this.errorToFilter = null;
    if (this.relatedFields || !this.autoload) {
      for (let i = 0; i < this.data.dependientes.length; i++) {
        const element: PedidoVentaCaracteristicaDTO = this.data.dependientes[i];
        if (!element.valorOpcion && element.campoDTO.formato === DocumentoPlantillaCaracteristicaEnum.PROCESO && !PlantillaHelper.buscarPropiedad(element.campoDTO.propiedades, PlantillaHelper.PERMISO_CAMPO_OPCIONAL)) {
          this.errorToFilter = 'Por favor coloca un valor en el campo ' + element.campoDTO.nombre;
          return;
        }
      }
    }
    this.listarProductosAsincronos();
  }

  searchAsincronous() {
    if (this.isLoading) { return; }
    this.errorToFilter = null;
    if (this.relatedFields || !this.autoload) {
      if (this.fControl.value !== undefined && this.fControl.value.length === 0) {
        this.errorToFilter = 'Por favor coloca un valor en el campo de busqueda';
        return;
      }
      this.listarProductosAsincronos();
    }
  }

  listarProductosAsincronos() {
    // Consulta los productos disponibles para el campo
    const nFilter: PedidoVentaCaracteristicaFilterDTO = this.transformPVCtoFilter(this.data);
    nFilter.filtroParametro = this.fControl.value;
    this.isLoading = true;
    this.api.consultarDatosBase(nFilter, this.urlServer).subscribe({
      next: (_value: PedidoVentaCaracteristicaFilterDTO) => {
        this.isLoading = false;
        // En caso que sea la primera vez carga la info al campo
        if (this.autoload && !this.productosDisponibles && !this.relatedFields) {
          this.loadInfo(_value);
        } else {
          this.productosDisponibles = Object.assign([], _value.campoDTO.productos);
          if (this.productosDisponibles.length === 0) {
            Swal.fire('Sin resultados', 'No encontramos resultados por el filtro' + this.fControl.value, 'info');
          } else {
            if (this.productosDisponibles.length === 1) {
              this.addProduct(this.productosDisponibles[0]);
            } else {
              this.productosFiltrados = Object.assign([], _value.campoDTO.productos);
              this.showProducts();
            }
          }
        }
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }


  private loadInfo(_value: PedidoVentaCaracteristicaFilterDTO) {
    // Copia toda la informacion a las variables del campo
    this.productosDisponibles = Object.assign([], _value.campoDTO.productos);
    const plantillaBase = this.templateService.getTemplate(this.structure.plantilla, this.urlServer);
    for (let i = 0; i < plantillaBase.caracteristicas.length; i++) {
      const iCampo = plantillaBase.caracteristicas[i];
      if (iCampo.llaveTabla === this.structure.llaveTabla) {
        iCampo.productos = _value.campoDTO.productos;
        break;
      }
    }
    // Vuelve a iniciar para continuar con el proceso
    this.iniciar();
  }

  addProduct(producto: ProductoDTO) {
    if (!producto || !producto.llaveTabla) { return; }
    if (producto.detallePlantilla) {
      const copyDetalle: DetallePedidoVentaDTO = new DetallePedidoVentaDTO();
      copyDetalle.productoCodigo = producto.detallePlantilla.productoCodigo;
      copyDetalle.producto = producto.detallePlantilla.producto;
      copyDetalle.cantidad = producto.detallePlantilla.cantidad;
      copyDetalle.nombre = producto.detallePlantilla.nombre;
      copyDetalle.productoImagen = producto.detallePlantilla.productoImagen;
      copyDetalle.productoDocumento = producto.detallePlantilla.productoDocumento;
      copyDetalle.valorSubtotal = producto.detallePlantilla.valorSubtotal;
      copyDetalle.valorUnitario = producto.detallePlantilla.valorUnitario;
      copyDetalle.valorTotal = producto.detallePlantilla.valorTotal;
      copyDetalle.valorMinimo = producto.detallePlantilla.valorMinimo;
      copyDetalle.valorMaximo = producto.detallePlantilla.valorMaximo;
      copyDetalle.tarifas = producto.detallePlantilla.tarifas;
      copyDetalle.plantillaDetalle = producto.detallePlantilla.plantillaDetalle;
      if (producto.detallePlantilla.documentoDetalle && producto.detallePlantilla.documentoDetalle.caracteristicas) {
        copyDetalle.documentoDetalle = new PedidoVentaDTO();
        copyDetalle.documentoDetalle.plantilla = producto.detallePlantilla.documentoDetalle.plantilla;
        copyDetalle.documentoDetalle.caracteristicas = [];
        for (
          let i = 0;
          i < producto.detallePlantilla.documentoDetalle.caracteristicas.length;
          i++
        ) {
          const campoDetalle = producto.detallePlantilla.documentoDetalle.caracteristicas[i];
          const uc: PedidoVentaCaracteristicaDTO = new PedidoVentaCaracteristicaDTO();
          uc.campo = campoDetalle.campo;
          uc.campoDTO = campoDetalle.campoDTO;

          uc.valorOpcion = campoDetalle.valorOpcion; // sin esto carga el producto del formulario
          uc.principal = campoDetalle.principal;
          uc.valorNumero = campoDetalle.valorNumero;
          uc.valorText = campoDetalle.valorText;

          if (this.data.dependientes) {
            for (let index = 0; index < this.data.dependientes.length; index++) {
              const element = this.data.dependientes[index];
              if (element.campoDTO.codigo === uc.campoDTO.codigo) {
                uc.valorOpcion = element.valorOpcion;
                uc.valorNumero = element.valorNumero;
                uc.valorText = element.valorText;
                uc.principal = element.principal;
                break;
              }
            }
          }

          if (campoDetalle.campoDTO.codigo === 'PRODUCTO') {
            uc.valorOpcion = producto.documento;
            uc.valorText = producto.nombre
          }
          /*if (campoDetalle.campoDTO.codigo ==='DOCUMENTO'){
            uc.valorOpcion = this.data.campoDTO.plantilla;
            uc.valorText = this.data.campoDTO.plantillaNombre;
            uc.principal = this.parent;
          }*/
          copyDetalle.documentoDetalle.caracteristicas.push(uc);
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
      if (this.unicoProducto) {
        // Por el momento los unicos no cargan valores esto lo tendre que revisar despues
        this.fControl.setValue(producto.codigo + ' - ' + producto.nombre);
      } else {
        // Lsa caracteristicas me sirven en roa, comentarie esa parte y no se abria de una vez el pop
        if (
          copyDetalle.valorMinimo !== copyDetalle.valorMaximo
          || !this.isEmpty(this.obtenerValor(PlantillaHelper.ITEM_DETAIL_FORM_VISIBLE))
          || (copyDetalle.documentoDetalle && copyDetalle.documentoDetalle.caracteristicas &&
            copyDetalle.documentoDetalle.caracteristicas.length !== 0)
        ) {
          this.modificarDetallePedido(copyDetalle);
        }
        this.fControl.setValue('');
      }
      this.actualizarDetalles(producto);
    }
    this.showCategories();
  }

  retirarProducto(item: DetallePedidoVentaDTO) {
    const index = this.data.detalles.indexOf(item, 0);
    if (index > -1) {
      this.data.detalles.splice(index, 1);
    }
    this.data.detalles = Object.assign([], this.data.detalles); // Para que se refresque la lista
    this.actualizarDetalles(null);
  }

  /*Esto lo realice para corregir el error al modificar los valores de los productos que tenian funciones*/
  updateDetail(item: DetallePedidoVentaDTO) {
    if (this.isEnabled && !item.tarifas
      && !this.isEmpty(this.obtenerValor(PlantillaHelper.DETALLE_TARIFARIO_SQL))) {
      const nFilter: PedidoVentaCaracteristicaFilterDTO = new PedidoVentaCaracteristicaFilterDTO();
      nFilter.campo = this.structure.llaveTabla;
      nFilter.dependientes = this.data.dependientes;
      nFilter.llaveTabla = item.llaveTabla;
      nFilter.filtroParametro = item.productoCodigo;
      this.isLoading = true;
      this.api.consultarDatosBase(nFilter, this.urlServer).subscribe({
        next: (_value: PedidoVentaCaracteristicaFilterDTO) => {
          this.isLoading = false;
          item.tarifas = _value.campoDTO.productos[0].detallePlantilla.tarifas;
          this.modificarDetallePedido(item);
        },
        error: () => {
          this.isLoading = false;
        },
      });
    } else {
      this.modificarDetallePedido(item);
    }
  }


  modificarDetallePedido(item: DetallePedidoVentaDTO) {

    const _propForm = this.obtenerValor(PlantillaHelper.ITEM_DETAIL_FORM_VISIBLE);
    if (!this.isEmpty(_propForm)) {
      if (item.documentoDetalle == null) {
        item.documentoDetalle = new PedidoVentaDTO();
        item.documentoDetalle.plantilla = item.plantillaDetalle;
      }

      if (this.data.dependientes) {


        for (let index = 0; index < this.data.dependientes.length; index++) {
          const element = this.data.dependientes[index];
          let fieldCodeToFill = element.campoDTO.codigo;
          for (let i = 0; i < this.relatedFields.length; i++) {
            const dependentIterato = this.relatedFields[i];
            if (dependentIterato.valor === element.campo) {
              const relations = this.templateService.getPropertyRelation(dependentIterato.llaveTabla);
              if (!relations || relations.length == 0) {
                //Copiado de tipo proceso
                const filtro: RelacionInternaFilterDTO = new RelacionInternaFilterDTO();
                filtro.estado = StatesEnum.ACTIVE;
                filtro.propiedad = dependentIterato.llaveTabla;
                //this.isLoadingList = true;
                this.api.relacionesPropiedad(filtro, this.urlServer).subscribe({
                  next: (value: RelacionInternaDTO[]) => {
                    if (!value || value.length === 0) {
                      //Creo una relacion falsa para que no vuelva a filtrar
                      const ri: RelacionInternaDTO = new RelacionInternaDTO();
                      ri.propiedad = dependentIterato.llaveTabla;
                      ri.campo = "FALSE";
                      ri.plantilla = "FALSE";
                      ri.auxiliar = "FALSE";
                      value = [];
                      value.push(ri);
                    }
                    this.templateService.addRelations(value);
                    //this.isLoadingList = false;
                    this.modificarDetallePedido(item);
                  },
                  error: () => {
                    //this.isLoadingList = false;
                  },
                });
                return;
              } else {
                if(relations[0].campo!== 'FALSE' ){
                  fieldCodeToFill = relations[0].campo;
                }
              }
            }
          }

          for (
            let i = 0;
            i < item.documentoDetalle.caracteristicas.length;
            i++
          ) {
            const uc = item.documentoDetalle.caracteristicas[i];
            if (fieldCodeToFill === uc.campoDTO.codigo || fieldCodeToFill === uc.campo) {
              uc.valorOpcion = element.valorOpcion;
              uc.valorNumero = element.valorNumero;
              uc.valorText = element.valorText;
              uc.principal = element.principal;
              break;
            }
          }
        }
      }



      this.utilsService.modalWithParams(item.documentoDetalle, false, null, true).subscribe((res) => {
        if (res) {
          item.documentoDetalle = res.data;
          this.updateDetailNumbersAfterFormWindow(item);
        }
        this.actualizarDetalles(null);
      });
    } else {
      const dialogRef: MatDialogRef<any> = this.dialog.open(ProductComponent, {
        width: '720px',
        maxHeight: '90vh',
        disableClose: true,
        data: { data: item, allowEdit: this.isEnabled },
      });
      dialogRef.afterClosed().subscribe((resp) => {
        if (!resp) {
          this.data.detalles.splice(0, 1);
          this.data.detalles = Object.assign([], this.data.detalles); // Para que se refresque la lista
        }
        this.actualizarDetalles(null);
      });
    }
  }

  cantidadTarifario(pItem: DetallePedidoVentaDTO, pProperty: string): number {
    const _campoCantidad2Tarifario = PlantillaHelper.buscarValor(
      pItem.propiedades,
      pProperty
    );
    if (_campoCantidad2Tarifario) {
      for (let l = 0; l < pItem.documentoDetalle.caracteristicas.length; l++) {
        const formItemRecurso = pItem.documentoDetalle.caracteristicas[l];
        if (
          formItemRecurso.campo === _campoCantidad2Tarifario
        ) {
          return formItemRecurso.valorNumero;
        }
      }
    }
    return 0;
  }

  updateDetailNumbersAfterFormWindow(pItem: DetallePedidoVentaDTO) {
    pItem.cantidad = this.cantidadTarifario(pItem, PlantillaHelper.PRODUCTO_CAMPO_CANTIDAD);
    if (pItem.cantidad === 0) pItem.cantidad = 1;
    pItem.valorUnitario = this.cantidadTarifario(pItem, PlantillaHelper.PRODUCTO_CAMPO_VALOR_UNITARIO);
    pItem.valorTotal = this.cantidadTarifario(pItem, PlantillaHelper.PRODUCTO_CAMPO_TOTAL);
    pItem.valorSubtotal = undefined;
  }

  actualizarDetalles(producto: ProductoDTO) {
    let valorNumero = 0;
    for (let i = 0; i < this.data.detalles.length; i++) {
      const detalle = this.data.detalles[i];
      detalle.cantidadTotal = detalle.cantidad;
      if (detalle.cantidadPromocionBase > 0) {
        const cantPromo = Math.floor(
          detalle.cantidad / detalle.cantidadPromocionBase
        );
        detalle.cantidadTotal =
          detalle.cantidad + cantPromo * detalle.cantidadPromocion;
      }
      valorNumero = valorNumero + detalle.valorTotal;
    }
    this.data.valorNumero = valorNumero;
    if (producto) {
      if (!this.data.valorText) {
        this.data.valorText = '';
      }
      if (this.data.valorText.indexOf(producto.categoriaNombre) === -1) {
        this.data.valorText =
          this.data.valorText + producto.categoriaNombre + ', ';
      }
    }
    this.avisarModificacion();
  }

  /** Gets the total cost of all transactions. */
  getTotalCost() {
    if (!this.data.detalles) return 0;
    return this.data.detalles.map(t => t.valorTotal).reduce((acc, value) => acc + value, 0);
  }

  getColor(pState: string) {
    if (!pState) { return null; }
    return this.templateService.getColor(pState);
  }

  getColorFont(pState: string) {
    if (!pState) { return null; }
    return this.templateService.getColorFont(pState);
  }
}
