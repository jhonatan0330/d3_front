import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { UntypedFormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PedidoVentaCaracteristicaDTO, PedidoVentaCaracteristicaFilterDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { DocumentoPlantillaCaracteristicaEnum } from 'app/modules/full/neuron/model/sw42.enum';
import { ApiService } from 'app/modules/full/neuron/service/api.service';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import { FormulaHelper } from 'app/modules/full/neuron/formula.helper';
import { BaseComponent } from '../base/base.component';
import { debounceTime, distinctUntilChanged,  map, tap } from 'rxjs';
import { PropiedadDTO } from 'app/shared/shared.domain';
import { formatNumber, TitleCasePipe } from '@angular/common';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

@Component({
    selector: 'app-numero',
    templateUrl: './numero.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatProgressBar, MatFormField, MatLabel, MatInput, FormsModule, ReactiveFormsModule, TitleCasePipe]
})
export class NumeroComponent extends BaseComponent implements OnInit {
  private api = inject(ApiService);


  fControl = new UntypedFormControl(0, {
    updateOn: 'blur'
  });

  step = 1;
  formula: string;
  formulaMaximum: PropiedadDTO;
  formulaMinimum: PropiedadDTO;
  funcion: string;
  numeroDecimales = 2;

  ngOnInit() {
    super.ngOnInit();
    if (!this.data.valorNumero) {
      this.data.valorNumero = 0;
    }
    this.fControl.setValue(this.numberToInput(this.data.valorNumero));
    if (this.required) {
      this.fControl.setValidators(Validators.required);
      this.fControl.updateValueAndValidity();
    }
    this.startControl();
    if (this.funcion) {
      // Solo tomo unos segundos en los casos que el campo tenga funcion asi evito tantas consultas al server
      this.fControl.valueChanges
        .pipe(
          debounceTime(200)
        )
        .subscribe(() => {
          this.actualizar();
        });
    } else {
      this.fControl.valueChanges
      .pipe(
        distinctUntilChanged(),
        map(value=>{ 
          this.fControl.setValue(this.numberToInput(value), { emitEvent: false });
          return value;
        }),
        tap(()=> {
          this.actualizar();
          this.validateErrorMessage();
        })
      ).subscribe({ error: () => {} });
    }

    if (this.data.valorNumero !== Number(this.fControl.value.replace(/,/g, '').replace(/\s/g, ''))) {
      this.actualizar();
    }
  }

  onEnter(event: Event) {
    const input = event.target as HTMLInputElement;
    this.fControl.setValue(this.numberToInput(Number(input.value)));
  }

  startControl() {
    /*const steps: string = this.obtenerValor(PlantillaHelper.NUMERO_STEP);
    if (steps) { this.step = steps; }*/
    this.formula = this.obtenerValor(PlantillaHelper.NUMERO_FORMULA);
    this.formulaMaximum = this.obtenerPropiedad(PlantillaHelper.NUMERO_MAXIMO);
    this.formulaMinimum = this.obtenerPropiedad(PlantillaHelper.NUMERO_MINIMO);
    this.funcion = this.obtenerValor(PlantillaHelper.NUMERO_FUNCION);
    const decimales: string = this.obtenerValor(
      PlantillaHelper.NUMERO_REDONDEO
    );
    if (decimales) {
      this.numeroDecimales = Number(decimales);
    }
    if (this.data.valorText) {
      if (this.data.valorNumero === 0) {
        // Esto aplica para los formularios de clientes para llenar el id
        this.data.valorNumero = Number(this.data.valorText);
      }
      this.fControl.setValue(this.numberToInput(this.data.valorNumero));
    } else {
      if (!this.data.documento) {
        // Coloco para que se realice a los nuevos el calculo
        if (!this.isEmpty(this.formula) || !this.isEmpty(this.funcion)) {
          this.procesarCampo(this.transformPVCtoFilter(this.data));
          // txtNumero.value = Number(campo.valorNumero);
        } else {
          if (this.obtenerValorMultiple(PlantillaHelper.DEFAULT)) {
            this.data.valorNumero = Number(this.obtenerValor(PlantillaHelper.DEFAULT));
          }
        }
      }
    }
  }

  formatStringXML(texto: string): string {
    if (!texto) {
      return 'EMPTY';
    }
    texto = texto.replace(new RegExp(' ', 'g'), '_');
    texto = texto.replace('Ñ', 'N');
    texto = texto.trim();
    return texto;
  }

  numberToInput(_valueNumber:number): string{
    let _value = String(_valueNumber);
    _value = _value.replace(/,/g, '').replace(/\s/g, '');

    let numericValue = 0;

    if (/^[0-9+\-*/().]+$/.test(_value)) {
      try {
        // Evaluamos expresión matemática si es válida
        numericValue = Function('"use strict";return (' + _value + ')')();
      } catch (e) {
        numericValue = 0;
      }
    } else if (_value) {
      numericValue = 0;
    }

    return formatNumber(numericValue, 'en-US', '1.0-' + this.numeroDecimales);
  }


  actualizar() {
    let controlValue = this.fControl.value;
    if (!controlValue) {
      controlValue = '0';
    }else{
      controlValue = controlValue.replace(/,/g, '').replace(/\s/g, '');
    }
    if (this.data.valorNumero !== Number(controlValue)) {
      this.data.valorNumero = Number(controlValue);
      this.data.valorText = controlValue;
      this.avisarModificacion();
    }
    
  }

  private formulaReplaceDependents(textoCalculado: string): string {
    if (this.data && this.data.dependientes && this.data.dependientes.length !== 0) {
      if (!this.isEmpty(textoCalculado)) {
        // Inicia el calculo de cada deduccion
        for (let it = 0; it < this.data.dependientes.length; it++) {
          const iterable = this.data.dependientes[it];
          let valorNumero = iterable.valorNumero;
          if (!valorNumero) {
            valorNumero = 0;
          }
          const diccionario = new Map();
          if (iterable.campoDTO && iterable.campoDTO.formato === DocumentoPlantillaCaracteristicaEnum.PRODUCTO) {
            if (iterable.detalles) {
              for (let k = 0; k < iterable.detalles.length; k++) {
                const iterableDetalle = iterable.detalles[k];
                if (iterableDetalle.documentoDetalle.caracteristicas && iterableDetalle.documentoDetalle.caracteristicas.length !== 0) {
                  for (let l = 0; l < iterableDetalle.documentoDetalle.caracteristicas.length; l++
                  ) {
                    const iterableDetalleCampo = iterableDetalle.documentoDetalle.caracteristicas[l];
                    if (!diccionario.get(iterableDetalleCampo.campoDTO.codigo)) {
                      diccionario.set(iterableDetalleCampo.campoDTO.codigo, iterableDetalleCampo.valorNumero);
                    } else {
                      diccionario.set(iterableDetalleCampo.campoDTO.codigo, diccionario.get(iterableDetalleCampo.campoDTO.codigo) + iterableDetalleCampo.valorNumero);
                    }
                  }
                }
              }
            }
            //Esta parte la copie de arriba de producto
            //Cree una nueva para poder calcular los tipo proceso
          } else if (iterable.campoDTO && iterable.campoDTO.formato === DocumentoPlantillaCaracteristicaEnum.PROCESO && PlantillaHelper.buscarPropiedad(iterable.campoDTO.propiedades, PlantillaHelper.MULTIPLE)) {
            if (iterable.expedientes) {
              for (let m = 0; m < iterable.expedientes.length; m++) {
                const iterableExpediente = iterable.expedientes[m];
                if (iterableExpediente.caracteristicas && iterableExpediente.caracteristicas.length !== 0) {
                  for (let n = 0; n < iterableExpediente.caracteristicas.length; n++) {
                    const iterableExpedienteCampo = iterableExpediente.caracteristicas[n];
                    if (iterableExpediente.dinero) {
                      const codeToReplace = this.formatStringXML(iterableExpedienteCampo.campo) + "_" + this.formatStringXML(iterableExpedienteCampo.valorText);
                      if (!diccionario.get(codeToReplace)) {
                        diccionario.set(codeToReplace, iterableExpediente.dinero.valorTotal);
                      } else {
                        diccionario.set(codeToReplace, diccionario.get(codeToReplace) + iterableExpediente.dinero.valorTotal);
                      }
                    }
                  }
                }
              }
            }
          }
          for (const key of diccionario.keys()) {
            let nuevoValor = diccionario.get(key);
            if (!nuevoValor) { nuevoValor = 0; }
            textoCalculado = textoCalculado.split(iterable.campoDTO.codigo + '_' + key).join(nuevoValor.toFixed(8));
          }
          textoCalculado = textoCalculado.split(iterable.campoDTO.codigo).join(valorNumero.toString());
        }
      }
    }
    return textoCalculado;
  }

  procesarCampo(campoFiltro: PedidoVentaCaracteristicaFilterDTO) {
    if (!this.isEmpty(this.formula)) {
      const textoCalculado = this.formulaReplaceDependents(this.formula);
      let resultado = FormulaHelper.calcular(textoCalculado); // Lo puse por fuera de dependientes porque asi tambien se puede calcular
      resultado = Number(resultado.toFixed(this.numeroDecimales));
      if (this.data.valorNumero !== resultado) {
        this.fControl.setValue(this.numberToInput(resultado));
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
          for (let index = 0; index < this.data.dependientes.length; index++) {
            const pvc: PedidoVentaCaracteristicaDTO =
              this.data.dependientes[index];
            if (!pvc.valorOpcion) {
              if (
                !pvc.campoDTO ||
                pvc.campoDTO.formato ===
                DocumentoPlantillaCaracteristicaEnum.PROCESO
              ) {
                if(!PlantillaHelper.buscarPropiedad(pvc.campoDTO.propiedades, PlantillaHelper.PERMISO_CAMPO_OPCIONAL)){
                  if(!PlantillaHelper.buscarPropiedad(pvc.campoDTO.propiedades, PlantillaHelper.MULTIPLE)){
                  
                    return;
                  }
                }
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
        this.isLoading = true;
        this.api
          .consultarDatosBase(filtro, this.urlServer)
          .subscribe({
            next: (_value: PedidoVentaCaracteristicaFilterDTO) => {
              this.fControl.setValue(this.numberToInput(_value.valorNumeroMax));
              this.isLoading = false;
            },
            error: () => {
              this.isLoading = false;
            }
          });
      }
    }
  }

  setValorNumero(valor: number) {
    //if (this.fControl.value !== valor) {
      this.fControl.setValue(this.numberToInput(valor));
    //}
  }



  getInitialFocus(event) {
    event.target.select();
    // Cuando se necesitan decimales no los borro
    if (event.target.value === '0' && this.numeroDecimales === 0) {
      //event.target.value = '';
    }
  }

  validateErrorMessage() {
    this.errorMessage = null!;
    if (this.formulaMaximum) {
      const textoMaximum = this.formulaReplaceDependents(this.formulaMaximum.valor);
      const resultadoMaximum = FormulaHelper.calcular(textoMaximum);
      if (this.data.valorNumero > resultadoMaximum) {
        if (this.formulaMaximum.motivo) {
          this.errorMessage = 'En el campo ' + this.structure.nombre + ' ' + this.formulaMaximum.motivo + '. Maximo : ' + new Intl.NumberFormat('es-CO').format(resultadoMaximum);
        } else {
          this.errorMessage = 'En el campo ' + this.structure.nombre + ' el valor maximo que puedes colocar es ' + new Intl.NumberFormat('es-CO').format(resultadoMaximum);
        }

        return;
      }
    }
    if (this.formulaMinimum) {
      const textoMinimum = this.formulaReplaceDependents(this.formulaMinimum.valor);
      const resultadoMinimum = FormulaHelper.calcular(textoMinimum);
      if (this.data.valorNumero < resultadoMinimum) {
        if (this.formulaMinimum.motivo) {
          this.errorMessage = 'En el campo ' + this.structure.nombre + ' ' + this.formulaMinimum.motivo + '. Minimo : ' + new Intl.NumberFormat('es-CO').format(resultadoMinimum);
        } else {
          this.errorMessage = 'En el campo ' + this.structure.nombre + ' el valor minimo que puedes colocar es ' + new Intl.NumberFormat('es-CO').format(resultadoMinimum);
        }
        return;
      }
    }
  }

  send2Server(): boolean {
    if (this.isLoading) { return false; }

    this.errorMessage = null!;
    if (this.required && !this.data.valorNumero && !this.isInvisible) {
      this.errorMessage = "En la plantilla " + this._structure.plantillaNombre + " es obligatorio registrar el campo " + this._structure.nombre + ")"
    }

    if (this.errorMessage) {
      const input = document.getElementById(this.idField!) as HTMLInputElement;
      if (input) { input.focus(); }
      return false;
    }
    return true;
  }
}
