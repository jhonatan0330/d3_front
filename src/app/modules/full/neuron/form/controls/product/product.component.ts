import { AfterViewInit, Component, OnInit, Type, ViewContainerRef, ChangeDetectionStrategy, inject, viewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  DetallePedidoVentaDTO,
  ProductoInventarioDTO
} from 'app/modules/full/neuron/model/sw42.domain';
import { DocumentoPlantillaCaracteristicaEnum } from 'app/modules/full/neuron/model/sw42.enum';
import { ApiService } from 'app/modules/full/neuron/service/api.service';
import { getComponent } from 'app/modules/full/neuron/form-helper';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import { IDynamicControl } from '../base/base.component';
import { PropiedadDTO } from 'app/shared/shared.domain';
import { TarifaDTO } from 'app/modules/full/neuron/model/tariff.domain';
import { MatIcon } from '@angular/material/icon';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { DecimalPipe } from '@angular/common';

@Component({
    selector: 'form-control-product',
    templateUrl: './product.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatIcon,MatTable,MatColumnDef,MatHeaderCellDef,MatHeaderCell,MatCellDef,MatCell,MatHeaderRowDef,MatHeaderRow,MatRowDef,MatRow,DecimalPipe]
})
export class ProductComponent implements OnInit, AfterViewInit {
  data = inject(MAT_DIALOG_DATA);
  dialogRef = inject<MatDialogRef<ProductComponent>>(MatDialogRef);
  private api = inject(ApiService);


  detallePedidoVenta = new DetallePedidoVentaDTO();
  montos = false;
  server: string;

  campoMinima: string;
  campoValorUnitario: PropiedadDTO | null;
  campoCantidad2Tarifario: string | null;
  campoTotal: PropiedadDTO | null;

  inventories: ProductoInventarioDTO[];
  isLoading = false; // ayuda a mostrar la barra de progreso en las busqueas
  allowEdit = false;

  dynamicControls: IDynamicControl[] = [];
  readonly myForm = viewChild('dynamycFormElement', { read: ViewContainerRef });

  ngOnInit(): void {
    this.detallePedidoVenta = this.data.data;
    this.allowEdit = this.data.allowEdit;
    this.campoMinima = PlantillaHelper.buscarValor(
      this.detallePedidoVenta.propiedades,
      PlantillaHelper.PRODUCTO_CAMPO_VALOR_MINIMO
    );
    this.campoValorUnitario = PlantillaHelper.buscarPropiedad(
      this.detallePedidoVenta.propiedades,
      PlantillaHelper.PRODUCTO_CAMPO_VALOR_UNITARIO
    );
    this.campoCantidad2Tarifario = PlantillaHelper.buscarValor(
      this.detallePedidoVenta.propiedades,
      PlantillaHelper.PRODUCTO_CAMPO_CANTIDAD
    );
    this.campoTotal = PlantillaHelper.buscarPropiedad(
      this.detallePedidoVenta.propiedades,
      PlantillaHelper.PRODUCTO_CAMPO_TOTAL
    );
    if (this.campoCantidad2Tarifario === '') {
      this.campoCantidad2Tarifario = null;
    }
    // this.cantidadReal = this.detallePedidoVenta.cantidad;

    if (this.campoValorUnitario) {
      this.montos = false;
    } else {
      if (
        this.detallePedidoVenta.valorMinimo ===
        this.detallePedidoVenta.valorMaximo
      ) {
      } else {
        if (
          this.detallePedidoVenta.tarifas &&
          this.detallePedidoVenta.tarifas.length !== 0
        ) {
          this.montos = true;
        }
      }
    }
    // addObserver(ServiceMethod.ACTUALIZAR + Constants.TARIFA_EVENT, this.changeTarifa);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.showFields();
    });
  }

  // Agrega los campos al formulario
  showFields() {
    if (
      !this.detallePedidoVenta.documentoDetalle.caracteristicas ||
      this.detallePedidoVenta.documentoDetalle.caracteristicas.length === 0
    ) {
      return;
    }

    for (let d = 0; d < this.detallePedidoVenta.documentoDetalle.caracteristicas.length; d++) {
      const _campo = this.detallePedidoVenta.documentoDetalle.caracteristicas[d];
      const componentDynamic: Type<any> = getComponent(_campo.campoDTO);
      const componentRef = this.myForm()!.createComponent<IDynamicControl>(
        componentDynamic
      );
      componentRef.instance.structure = _campo.campoDTO;
      componentRef.instance.productForm = this;
      componentRef.instance.formIsEnabled = this.allowEdit;
      for (
        let index = 0;
        index < this.detallePedidoVenta.documentoDetalle.caracteristicas.length;
        index++
      ) {
        const element = this.detallePedidoVenta.documentoDetalle.caracteristicas[index];
        if (element.campo === _campo.campoDTO.llaveTabla) {
          componentRef.instance.data = element;
          break;
        }
      }
      
      this.dynamicControls.push(componentRef.instance);
      
    }

    // Colocar listener de Dependientes
    for (let j = 0; j < this.detallePedidoVenta.documentoDetalle.caracteristicas.length; j++) {
      const iBase = this.detallePedidoVenta.documentoDetalle.caracteristicas[j].campoDTO;
      const codigoDepende: PropiedadDTO[] = PlantillaHelper.buscarValorMultiple(
        iBase.propiedades,
        PlantillaHelper.DEPENDE
      )!;
      if (codigoDepende) {
        let iCampoDependiente; // Identifico el campo dependiente
        for (let index = 0; index < this.dynamicControls.length; index++) {
          const iFieldDependiente: IDynamicControl = this.dynamicControls[
            index
          ];
          if (iFieldDependiente.structure.codigo === iBase.codigo) {
            iCampoDependiente = iFieldDependiente;
            break;
          }
        }
        if (iCampoDependiente) {
          for (let z = 0; z < codigoDepende.length; z++) {
            const codigo = codigoDepende[z];
            for (let k = 0; k < this.dynamicControls.length; k++) {
              const iFieldReferenciado = this.dynamicControls[k];
              if (iFieldReferenciado.structure.llaveTabla === codigo.valor) {
                iFieldReferenciado.adicionarListener(iCampoDependiente);
                break;
              }
            }
          }
        }
      }
    }

    if (this.campoValorUnitario) {
      for (let j = 0; j < this.dynamicControls.length; j++) {
        const formItemRecurso = this.dynamicControls[j];
        if (
          formItemRecurso.structure.llaveTabla === this.campoValorUnitario.valor
        ) {
          formItemRecurso.setValorNumero(this.detallePedidoVenta.valorUnitario);
          break;
        }
      }
    }
    if (!this.detallePedidoVenta.llaveTabla) {
      this.actCaract();
    }
  }

  actCaract() {
    if (this.campoCantidad2Tarifario) {
      this.detallePedidoVenta.cantidad = this.cantidadTarifario();
    }
    if (this.detallePedidoVenta.cantidad === 0) {
      this.detallePedidoVenta.cantidad = 1;
    }

    let tarifa: TarifaDTO = this.escogerTarifa(null!);
    let stepValorUnitario: IDynamicControl | null = null;
    let valorUnitario = tarifa.valor;

    // paso esto arriba para que se actualicen campos antes de que calcule
    for (let i = 0; i < this.dynamicControls.length; i++) {
      const formItemRecurso = this.dynamicControls[i];
      if (
        formItemRecurso.structure.formato ===
        DocumentoPlantillaCaracteristicaEnum.NUMERO
      ) {
        const idTarifa: string = PlantillaHelper.buscarValor(
          formItemRecurso.structure.propiedades,
          PlantillaHelper.DETALLE_TARIFA_PRODUCTO
        );
        if (!idTarifa && idTarifa.length !== 0) {
          tarifa = this.escogerTarifa(idTarifa);
          formItemRecurso.setValorNumero(this.detallePedidoVenta.cantidad * tarifa.valor);
        }
      }
      if (
        this.campoMinima &&
        this.campoMinima === formItemRecurso.structure.llaveTabla
      ) {
        formItemRecurso.setValorNumero(tarifa.totalMinimo);
      }
      if (
        this.campoValorUnitario &&
        this.campoValorUnitario.valor === formItemRecurso.structure.llaveTabla
      ) {
        stepValorUnitario = formItemRecurso;
        if (!tarifa.llaveTabla || (tarifa.valorMinimo !== tarifa.valorMaximo && tarifa.valorMinimo !== tarifa.valor)) {
          valorUnitario = formItemRecurso.data.valorNumero;
        } else {
          valorUnitario = tarifa.valor;
          formItemRecurso.setValorNumero(valorUnitario);
        }
      }
    }

    this.detallePedidoVenta.valorUnitario = valorUnitario;
    
    if(tarifa.valorMaximo<this.detallePedidoVenta.valorUnitario) {
      this.detallePedidoVenta.valorMaximo = this.detallePedidoVenta.valorUnitario;
    }else{
      this.detallePedidoVenta.valorMaximo = tarifa.valorMaximo;
    }

    this.detallePedidoVenta.valorMinimo = tarifa.valorMinimo;


    if (this.campoTotal) {
      for (let l = 0; l < this.dynamicControls.length; l++) {
        const formItemRecurso = this.dynamicControls[l];
        if (
          formItemRecurso.structure.llaveTabla === this.campoTotal.valor
        ) {
          this.detallePedidoVenta.valorSubtotal = formItemRecurso.data.valorNumero;
          break;
        }
      }
    } else {
      this.detallePedidoVenta.valorSubtotal =
        this.cantidadTarifario() * this.detallePedidoVenta.valorUnitario;
    }

    if(!this.detallePedidoVenta.valorSubtotal) {this.detallePedidoVenta.valorSubtotal = 0; }
    this.detallePedidoVenta.valorTotal = Math.round(
      this.detallePedidoVenta.valorSubtotal
    );
    if (stepValorUnitario) {
      stepValorUnitario.data.valorNumero = this.detallePedidoVenta.valorUnitario;
    }
    // if(this.funcionSincronizar!=null) this.funcionSincronizar.call();
  }

  escogerTarifa(tarifarioBase: string): TarifaDTO {
    const tarifa: TarifaDTO = new TarifaDTO();
    tarifa.valor = 0;
    if (
      this.detallePedidoVenta.tarifas &&
      this.detallePedidoVenta.tarifas.length !== 0
    ) {
      if (!this.campoValorUnitario) {
        this.montos = true;
      }
      let tarifariosUsadosOtrosCampos: string[] | undefined;
      if (
        this.detallePedidoVenta.documentoDetalle.caracteristicas &&
        this.detallePedidoVenta.documentoDetalle.caracteristicas.length !== 0
      ) {
        for (
          let i = 0;
          i < this.detallePedidoVenta.documentoDetalle.caracteristicas.length;
          i++
        ) {
          const iCampo = this.detallePedidoVenta.documentoDetalle.caracteristicas[i];
          if (
            iCampo.campoDTO &&
            iCampo.campoDTO.propiedades &&
            iCampo.campoDTO.propiedades.length !== 0
          ) {
            const tarifario: string = PlantillaHelper.buscarValor(
              iCampo.campoDTO.propiedades,
              PlantillaHelper.DETALLE_TARIFA_PRODUCTO
            );
            if (!tarifario && tarifario.length !== 0 ) {
              if (!tarifariosUsadosOtrosCampos) {
                tarifariosUsadosOtrosCampos = [];
              }
              tarifariosUsadosOtrosCampos.push(tarifario);
            }
          }
        }
      }
      for (let j = 0; j < this.detallePedidoVenta.tarifas.length; j++) {
        const iTarifa = this.detallePedidoVenta.tarifas[j];
        let usado = false;
        if (!tarifarioBase) {
          if (tarifariosUsadosOtrosCampos) {
            for (let t = 0; t < tarifariosUsadosOtrosCampos.length; t++) {
              const iTarifarioUsado = tarifariosUsadosOtrosCampos[t];
              if (iTarifarioUsado === iTarifa.tarifario) {
                usado = true;
                break;
              }
            }
          }
        } else {
          usado = !(tarifarioBase === iTarifa.tarifario);
        }
        if (!usado) {
          if (iTarifa.cantidadMinima === 0 && iTarifa.cantidadMaxima === 0) {
            if (tarifa.valor === 0 || tarifa.valor > iTarifa.valor) {
              // En box el cliente tenia un precio mayor
              return iTarifa;
            }
          } else {
            const pCantidad = this.cantidadTarifario();
            if (
              iTarifa.cantidadMinima <= Math.ceil(pCantidad) &&
              (iTarifa.cantidadMaxima >= Math.ceil(pCantidad) || iTarifa.cantidadMaxima ===0)
            ) {
              if (tarifa.valor === 0 || tarifa.valor > iTarifa.valor) {
                return iTarifa;
              }
            }
          }
        }
      }
    }
    return tarifa;
  }

  closeWithValidation() {
    if (
      this.detallePedidoVenta.valorUnitario >
      this.detallePedidoVenta.valorMaximo
    ) {
      alert(
        'El valor maximo del producto es de ' +
          this.detallePedidoVenta.valorMaximo
      );
      return;
    }
    if (
      this.detallePedidoVenta.valorUnitario <
      this.detallePedidoVenta.valorMinimo
    ) {
      alert(
        'El valor minimo del producto es de ' +
          this.detallePedidoVenta.valorMinimo
      );
      return;
    }
    this.dialogRef.close(this.detallePedidoVenta);
  }

  consultarInventarios() {
    this.isLoading = true;
    this.api.consultarInventario(this.detallePedidoVenta.producto, this.server).subscribe({
      next: (_value: ProductoInventarioDTO[]) => {
        this.inventories = _value;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  cantidadTarifario(): number {
    let pCantidad: number = this.detallePedidoVenta.cantidad;
    if (this.campoCantidad2Tarifario) {
      for (let l = 0; l < this.dynamicControls.length; l++) {
        const formItemRecurso = this.dynamicControls[l];
        if (
          formItemRecurso.structure.llaveTabla === this.campoCantidad2Tarifario
        ) {
          pCantidad = formItemRecurso.data.valorNumero;
          break;
        }
      }
    }
    if(!pCantidad) { pCantidad = 0;}
    return pCantidad;
  }

}
