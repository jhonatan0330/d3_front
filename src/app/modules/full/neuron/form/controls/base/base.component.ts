import { Component, OnInit } from '@angular/core';
import { ProductComponent } from 'app/modules/full/neuron/form/controls/product/product.component';
import {
  DocumentoPlantillaCaracteristicaDTO,
  PedidoVentaCaracteristicaDTO,
  PedidoVentaCaracteristicaFilterDTO,
  PedidoVentaDTO,
} from 'app/modules/full/neuron/model/sw42.domain';
import { PropiedadDTO } from 'app/shared/shared.domain';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import { BehaviorSubject, Observable } from 'rxjs';
import { FormComponent } from '../../form.component';

export interface IDynamicControl {
  structure: DocumentoPlantillaCaracteristicaDTO;
  data: PedidoVentaCaracteristicaDTO;
  productForm: ProductComponent;
  parent: PedidoVentaDTO;
  formIsEnabled: boolean; //Muestra si el formulario tiene permisos para modificar

  urlServer: string;
  isInvisible: boolean;

  formIsModified: BehaviorSubject<boolean | null>;

  adicionarListener(pField: IDynamicControl);
  actualizarDependencia(campoModificado: PedidoVentaCaracteristicaDTO);
  notificarModificacion(campoFiltro: PedidoVentaCaracteristicaDTO);
  validateVisibility(textSelected: String);
  setValorNumero(valor: number);

  send2Server(): boolean;

  form: FormComponent;
}

@Component({
  selector: 'app-base',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss'],
})
export class BaseComponent implements OnInit, IDynamicControl {
  data: PedidoVentaCaracteristicaDTO;
  parent: PedidoVentaDTO;
  relatedFields: PropiedadDTO[];
  propVisibleDepende: PropiedadDTO[];
  listeners: IDynamicControl[];
  required = true;
  isEnabled = true;
  formIsEnabled = true;
  isLoading = false; // ayuda a mostrar la barra de progreso en las busqueas
  help = 'x';
  isInvisible = false;
  productForm: ProductComponent;
  form: FormComponent;
  urlServer: string;
  formIsModified: BehaviorSubject<boolean | null> = new BehaviorSubject(null);

  _structure: DocumentoPlantillaCaracteristicaDTO;
  get structure(): DocumentoPlantillaCaracteristicaDTO {
    return this._structure;
  }
  set structure(value: DocumentoPlantillaCaracteristicaDTO) {
    this._structure = value;
    this.required = PlantillaHelper.isEmpty(this.structure.propiedades, PlantillaHelper.PERMISO_CAMPO_OPCIONAL);
    this.isInvisible = !PlantillaHelper.isEmpty(this.structure.propiedades, PlantillaHelper.INVISIBLE);
    this.relatedFields = this.obtenerValorMultiple(PlantillaHelper.DEPENDE);
    this.propVisibleDepende = this.obtenerValorMultiple(PlantillaHelper.VISIBLE_VALOR_DEPENDIENTE);
  }
  constructor() { }

  ngOnInit(): void {
    this.isEnabled = this._getEditable();
    if(!this.form) { // Esto es para los campos en filtro de crud
      this.required = false;
    }
  }

  actualizar(): void { }

  _getEditable(): boolean {
    const resultado = PlantillaHelper.isEmpty(
      this.structure.propiedades,
      PlantillaHelper.PERMISO_CAMPO_BLOQUEAR
    );
    if (this.data && this.data.documento) {
      if (
        !PlantillaHelper.isEmpty(
          this.structure.propiedades,
          PlantillaHelper.PERMISO_CAMPO_MODIFICABLE
        )
      ) {
        if (this.data.campoDTO) {
          return !PlantillaHelper.isEmpty(
            this.data.campoDTO.propiedades,
            PlantillaHelper.PERMISO_CAMPO_MODIFICABLE
          ); // campo.campoDTO.modificable;
        }
      } else {
        return false;
      }
    }
    return resultado;
  }

  getValorTexto(): String {
    return this.data == null ? null : this.data.valorText;
  }

  getValorNumero(): number {
    return this.data == null ? 0 : this.data.valorNumero;
  }

  setValorNumero(valor: number): void {
    this.data.valorNumero = valor;
  }

  setCampo(campo: PedidoVentaCaracteristicaDTO): void {
    this.data = campo;
  }

  isEmpty(s: string): boolean {
    return s == null || s.length === 0;
  }

  actualizarDependencia(campoModificado: PedidoVentaCaracteristicaDTO) {
    if (this.data) {
      if (this.data.dependientes) {
        for (const iCampo of this.data.dependientes) {
          if (iCampo.campoDTO == null || campoModificado.campoDTO == null) {
            return;
          }
          if (iCampo.campoDTO.codigo === campoModificado.campoDTO.codigo) {
            this.data.dependientes.splice(
              this.data.dependientes.indexOf(iCampo),
              1
            );
            break;
          }
        }
      } else {
        this.data.dependientes = [];
      }
      this.data.dependientes.push(campoModificado);
    }
  }

  avisarModificacion(inicioCampo: boolean = false, omitirFormModified: boolean = false): void {
    if (!inicioCampo && this.data) {
      this.data.modificado = true;
      if (!omitirFormModified) { this.formIsModified.next(true); }
    }
    if (this.listeners && this.listeners.length !== 0) {
      for (let index = 0; index < this.listeners.length; index++) {
        const element = this.listeners[index];
        element.actualizarDependencia(this.data);
        if (!inicioCampo) {
          element.notificarModificacion(this.data);
        }
        element.validateVisibility(this.getValorTexto());
      }
    }
    if (this.productForm) {
      this.productForm.actCaract();
    }
  }

  validateVisibility(textSelected: String) {
    if (this.propVisibleDepende) {
      for (let index = 0; index < this.propVisibleDepende.length; index++) {
        const propVisible = this.propVisibleDepende[index];
        if (propVisible.campo === this.structure.llaveTabla) {
          this.isInvisible = !(textSelected === propVisible.valor);
          break;
        }
      }
    }
  }

  adicionarListener(pField: IDynamicControl) {
    if (!this.listeners) {
      this.listeners = [];
    }
    if (!pField.data.dependientes) {
      pField.data.dependientes = [];
    }
    pField.data.dependientes.push(this.data);
    this.listeners.push(pField);
    pField.validateVisibility(this.getValorTexto())
  }

  obtenerValor(key: string): string {
    if (!this) { return ''; }
    return PlantillaHelper.buscarValor(this.structure.propiedades, key);
  }

  obtenerPropiedad(key: string): PropiedadDTO {
    return PlantillaHelper.buscarPropiedad(this.structure.propiedades, key);
  }

  obtenerTexto(key: string): String {
    const prop: PropiedadDTO = PlantillaHelper.buscarPropiedad(
      this.structure.propiedades,
      key
    );
    if (prop) {
      return prop.texto;
    }
    return '';
  }

  obtenerValorMultiple(key: string): PropiedadDTO[] {
    return PlantillaHelper.buscarValorMultiple(this.structure.propiedades, key);
  }

  transformPVCtoFilter(
    campoFiltro: PedidoVentaCaracteristicaDTO
  ): PedidoVentaCaracteristicaFilterDTO {
    const nFilter: PedidoVentaCaracteristicaFilterDTO =
      new PedidoVentaCaracteristicaFilterDTO();
    nFilter.campo = campoFiltro.campo;
    nFilter.campoDTO = campoFiltro.campoDTO;
    nFilter.dependientes = campoFiltro.dependientes;
    nFilter.documento = campoFiltro.documento;
    nFilter.estado = campoFiltro.estado;
    nFilter.expedientes = campoFiltro.expedientes;
    nFilter.llaveTabla = campoFiltro.llaveTabla;
    // nFilter.m = campoFiltro.modificado;
    // nFilter. = campoFiltro.principal;
    // nFilter.productosExclusivos = campoFiltro.productosExclusivos;
    nFilter.transaccionInactivo = campoFiltro.transaccionInactivo;
    nFilter.transaccionRegistro = campoFiltro.transaccionRegistro;
    nFilter.valorAuxiliar = campoFiltro.valorAuxiliar;
    // nFilter.val = campoFiltro.valorFecha;
    // nFilter.valo = campoFiltro.valorNumero;
    nFilter.valorOpcion = campoFiltro.valorOpcion;
    nFilter.valorText = campoFiltro.valorText;
    return nFilter;
  }

  notificarModificacion(campoFiltro: PedidoVentaCaracteristicaDTO) {
    this.procesarCampo(this.transformPVCtoFilter(campoFiltro));
  }

  procesarCampo(campoFiltro: PedidoVentaCaracteristicaFilterDTO) { }

  send2Server(): boolean {
    return true;
  }

  procesarXMLBase(
    pCampo: PedidoVentaCaracteristicaDTO
  ): PedidoVentaCaracteristicaDTO {
    return null;
  }

  submit: Function;

}
