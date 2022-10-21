import { Component,  OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { PedidoVentaCaracteristicaDTO } from 'app/model/sw42.domain';
import { PedidoVentaCaracteristicaFilterDTO } from 'app/model/sw42.filter';
import { PlantillaHelper } from 'app/shared/helpers/plantilla-helper';
import { BaseComponent } from '../base/base.component';

@Component({
  selector: 'app-texto',
  templateUrl: './texto.component.html'
})
export class TextoComponent extends BaseComponent implements OnInit {
  textoLargo = false;
  valorDefecto: string;

  fControl = new FormControl('');

  constructor() {
    super(); // super(base);
  }

  ngOnInit(): void {
    super.ngOnInit();
    if (this.data ) {
      if (this.data.valorText) {
        this.fControl.setValue(this.data.valorText);
      } else {
        if (!this.data.llaveTabla && this.valorDefecto) { this.fControl.setValue(this.valorDefecto)};
      }
    }
    this.valorDefecto = this.obtenerValor(PlantillaHelper.DEFAULT);
    this.textoLargo = !this.isEmpty(
      this.obtenerValor(PlantillaHelper.TEXTO_LARGO)
    );
    if (this.required) {
      this.fControl.setValidators(Validators.required);
      this.fControl.updateValueAndValidity();
    }
    /* if (this.isEnabled) {
      this.fControl.enable();
    } else {
      this.fControl.disable();
    }*/
    // Al finalzar se subscriben los cambios
    this.fControl.valueChanges.subscribe((value) => {
      this.actualizar();
     });
  }

  actualizar(): void {
     const nuevoValor =  this.fControl.value;
    if (this.data.valorText !== nuevoValor) {
       this.data.valorText = nuevoValor;
       this.avisarModificacion();
    }
  }

  procesarCampo(campoFiltro: PedidoVentaCaracteristicaFilterDTO): void {
    let textoCalculado: string = this.obtenerValor(
      PlantillaHelper.TEXTO_FORMULA
    );
    if (!this.isEmpty(textoCalculado)) {
      if (this.data.dependientes &&
        this.data.dependientes.length !== 0
      ) {
        for (let i = 0; i < this.data.dependientes.length; i++) {
          const element = this.data.dependientes[i];
          textoCalculado = textoCalculado.replace(
            element.campoDTO.codigo,
            (!element.valorText)? '' : element.valorText
          );
        }
      }
      this.fControl.setValue(textoCalculado);
      this.actualizar();
    }
  }

  getXMLBase(): string {
    return 'TEXTO';
  }

  procesarXMLBase(
    pCampo: PedidoVentaCaracteristicaDTO
  ): PedidoVentaCaracteristicaDTO {
    return pCampo;
  }
}
