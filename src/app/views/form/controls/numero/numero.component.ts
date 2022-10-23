import { Component, OnInit } from '@angular/core';
import { FormControl, UntypedFormControl, Validators } from '@angular/forms';
import { PedidoVentaCaracteristicaDTO } from 'app/model/sw42.domain';
import { DocumentoPlantillaCaracteristicaEnum } from 'app/model/sw42.enum';
import { PedidoVentaCaracteristicaFilterDTO } from 'app/model/sw42.filter';
import { ApiService } from 'app/service/api.service';
import { PlantillaHelper } from 'app/shared/helpers/plantilla-helper';
import { FormulaHelper } from 'app/shared/helpers/formula.helper';
import { BaseComponent } from '../base/base.component';
import { CurrencyMaskInputMode } from 'ngx-currency';

@Component({
  selector: 'app-numero',
  templateUrl: './numero.component.html'
})
export class NumeroComponent extends BaseComponent implements OnInit {
  fControl = new UntypedFormControl(0);

  step = 1;
  formula: string;
  formulaMaximum: string;
  formulaMinimum: string;
  funcion: string;
  isMoneda = false;
  numeroDecimales = 0;
  optionsMask = {
    precision: 0,
    prefix: '',
    inputMode: CurrencyMaskInputMode.NATURAL,
  };

  constructor(private api: ApiService) {
    super();
  }

  ngOnInit() {
    super.ngOnInit();
    if (!this.data.valorNumero) {
      this.data.valorNumero = 0;
    }
    this.fControl.setValue(this.data.valorNumero);
    if (this.required) {
      this.fControl.setValidators(Validators.required);
      this.fControl.updateValueAndValidity();
    }
    this.startControl();
    /* if (this.isEnabled) {
      this.fControl.enable();
    } else {
      this.fControl.disable();
    }*/
    // Al finalzar se subscriben los cambios
    this.fControl.valueChanges.subscribe((value) => {
      this.actualizar();
    });
    // Tenia un error en Factura de SW apenas abria no tomaba el valor
    if (this.data.valorNumero !== this.fControl.value) {
      this.actualizar();
    }
  }

  startControl() {
    /*const steps: string = this.obtenerValor(PlantillaHelper.NUMERO_STEP);
    if (steps) { this.step = steps; }*/
    this.formula = this.obtenerValor(PlantillaHelper.NUMERO_FORMULA);
    this.formulaMaximum = this.obtenerValor(PlantillaHelper.NUMERO_MAXIMO);
    this.formulaMinimum = this.obtenerValor(PlantillaHelper.NUMERO_MINIMO);
    this.funcion = this.obtenerValor(PlantillaHelper.NUMERO_FUNCION);
    if (this.obtenerPropiedad(PlantillaHelper.NUMERO_MONEDA)) {
      this.isMoneda = true;
    }
    const decimales: string = this.obtenerValor(
      PlantillaHelper.NUMERO_REDONDEO
    );
    if (decimales) {
      this.numeroDecimales = Number(decimales);
      this.optionsMask.precision = this.numeroDecimales;
    }
    if (this.data.valorText) {
      if (this.data.valorNumero === 0) {
        // Esto aplica para los formularios de clientes para llenar el id
        this.fControl.setValue(this.data.valorText);
        this.data.valorNumero = Number(this.data.valorText);
      } else {
        this.fControl.setValue(this.data.valorNumero);
      }
    } else {
      if (!this.data.documento) {
        // Coloco para que se realice a los nuevos el calculo
        if (!this.isEmpty(this.formula) || !this.isEmpty(this.funcion)) {
          this.procesarCampo(this.transformPVCtoFilter(this.data));
          // txtNumero.value = Number(campo.valorNumero);
        } else {
          if (this.obtenerValorMultiple(PlantillaHelper.DEFAULT)) {
            this.data.valorNumero = Number(
              this.obtenerValor(PlantillaHelper.DEFAULT)
            );
          }
        }
      }
    }
  }

  actualizar() {
    let controlValue = this.fControl.value;
    if (!controlValue) {
      controlValue = '0';
    }
    if(this.formulaMaximum) {
      const textoMaximum = this.formulaReplaceDependents(this.formulaMaximum);
      const resultadoMaximum = FormulaHelper.calcular(textoMaximum);
      if (controlValue > resultadoMaximum) {
        this.fControl.setValue(resultadoMaximum);
        return;
      }
    }
    if(this.formulaMinimum) {
      const textoMinimum = this.formulaReplaceDependents(this.formulaMinimum);
      const resultadoMinimum = FormulaHelper.calcular(textoMinimum);
      if (controlValue < resultadoMinimum) {
        this.fControl.setValue(resultadoMinimum);
        return;
      }
    }
    if (this.data.valorNumero !== controlValue) {
      this.data.valorNumero = Number(controlValue);
      this.data.valorText = controlValue;
      this.avisarModificacion();
    }
  }

  private formulaReplaceDependents(textoCalculado: string): string{
    if (
      this.data &&
      this.data.dependientes &&
      this.data.dependientes.length !== 0
    ) {
      if (!this.isEmpty(textoCalculado)) {
        // Inicia el calculo de cada deduccion
        for (let it = 0; it < this.data.dependientes.length; it++) {
          const iterable = this.data.dependientes[it];
          let valorNumero = iterable.valorNumero;
          if (!valorNumero) {
            valorNumero = 0;
          }
          if (
            iterable.campoDTO &&
            iterable.campoDTO.formato ===
              DocumentoPlantillaCaracteristicaEnum.PRODUCTO
          ) {
            const diccionario = new Map();
            if (iterable.detalles) {
              for (let k = 0; k < iterable.detalles.length; k++) {
                const iterableDetalle = iterable.detalles[k];
                if (
                  iterableDetalle.caracteristicas &&
                  iterableDetalle.caracteristicas.length !== 0
                ) {
                  for (
                    let l = 0;
                    l < iterableDetalle.caracteristicas.length;
                    l++
                  ) {
                    const iterableDetalleCampo =
                      iterableDetalle.caracteristicas[l];
                    if (
                      !diccionario.get(iterableDetalleCampo.campoDTO.codigo)
                    ) {
                      diccionario.set(
                        iterableDetalleCampo.campoDTO.codigo,
                        iterableDetalleCampo.valorNumero
                      );
                    } else {
                      diccionario.set(
                        iterableDetalleCampo.campoDTO.codigo,
                        diccionario.get(
                          iterableDetalleCampo.campoDTO.codigo
                        ) + iterableDetalleCampo.valorNumero
                      );
                    }
                  }
                }
              }
            }
            for (const key of diccionario.keys()) {
              let nuevoValor = diccionario.get(key);
              if (!nuevoValor) {
                nuevoValor = 0;
              }
              textoCalculado = textoCalculado
                .split(iterable.campoDTO.codigo + '_' + key)
                .join(nuevoValor.toFixed(8));
            }
          }
          textoCalculado = textoCalculado
            .split(iterable.campoDTO.codigo)
            .join(valorNumero.toString());
          console.log(
            'Codigo: ' +
              iterable.campoDTO.codigo +
              ' \t Valor:' +
              valorNumero.toFixed(8)
          );
        }
      }
    }
    return textoCalculado;
  }

  procesarCampo(campoFiltro: PedidoVentaCaracteristicaFilterDTO) {
    if (!this.isEmpty(this.formula)) {
      const textoCalculado = this.formulaReplaceDependents(this.formula);
      const resultado = FormulaHelper.calcular(textoCalculado); // Lo puse por fuera de dependientes porque asi tambien se puede calcular
      if (this.data.valorNumero !== resultado) {
        this.fControl.setValue(resultado);
        // Debido a que No se a colocado el listener de actualizar toca adecuar bien el campo
        // Esto generaba un error en los campos que no se modificaban en el servidor
        // Fallo en bbx calculando formuls iterativas, ver donde falla de  nuevo
        // this.data.valorNumero = Number(resultado);
        // this.data.valorText = resultado.toString();
      }
      return;
    }
    if (!this.isEmpty(this.funcion)) {
      if (campoFiltro) {
        const filtro: PedidoVentaCaracteristicaFilterDTO =
          new PedidoVentaCaracteristicaFilterDTO();
        if (this.relatedFields) {
          if (
            !this.data.dependientes ||
            this.data.dependientes.length !== this.relatedFields.length
          ) {
            return;
          }
          for (let index = 0; index < this.relatedFields.length; index++) {
            const pvc: PedidoVentaCaracteristicaDTO =
              this.data.dependientes[index];
            if (!pvc.valorOpcion) {
              if (
                !pvc.campoDTO ||
                pvc.campoDTO.formato ===
                  DocumentoPlantillaCaracteristicaEnum.PROCESO
              ) {
                return;
              }
            }
          }
          filtro.dependientes = this.data.dependientes;
        } else {
          // Si no tiene dependencia debe tener id de documento como minimo
          if (!this.data.documento) {
            return;
          }
        }
        // Por dependientes siempre coloco el base ahora toca ver en donde me falla
        filtro.campoDTO = this.structure;
        filtro.campo = this.structure.llaveTabla;
        filtro.documento = campoFiltro.documento;

        this.api
          .consultarDatosBase(filtro, this.urlServer)
          .subscribe((_value: PedidoVentaCaracteristicaFilterDTO) => {
            this.fControl.setValue(_value.valorNumeroMax);
          });
      }
    }
  }

  setValorNumero(valor: number) {
    if (this.fControl.value !== valor) {
      this.fControl.setValue(valor);
    }
  }

  getXMLBase(): string {
    return '0';
  }

  procesarXMLBase(
    pCampo: PedidoVentaCaracteristicaDTO
  ): PedidoVentaCaracteristicaDTO {
    pCampo.valorNumero = Number(pCampo.valorText);
    return pCampo;
  }

  getInitialFocus(event) {
    event.target.select();
    // Cuando se necesitan decimales no los borro
    if (event.target.value === '0' && this.numeroDecimales === 0) {
      event.target.value = '';
    }
  }
}
