import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { BaseComponent } from '../base/base.component';

@Component({
  selector: 'app-binario',
  templateUrl: './binario.component.html',
  styleUrls: ['./binario.component.scss'],
})
export class BinarioComponent extends BaseComponent implements OnInit {
  fControl = new FormControl(false);

  constructor() {
    super();
  }

  ngOnInit() {
    super.ngOnInit();
    if (this.data) {
      if (!this.data.valorNumero) { this.data.valorNumero = 0 }
      if (this.data.valorNumero === 1) { this.fControl.setValue(true);}
    }
    if (this.required) {
      this.fControl.setValidators(Validators.required);
      this.fControl.updateValueAndValidity();
    }
    this.startControl();
    if (this.isEnabled) {
      this.fControl.enable();
    } else {
      this.fControl.disable();
    }
    this.fControl.valueChanges.subscribe((value) => {
      this.actualizar();
    });
  }

  startControl() {
    /*if(chkBinario.selected){
      chkBinario.label = this.obtenerValor(BINARIO_VERDADERO);
    }else{
      chkBinario.label = this.obtenerValor(BINARIO_FALSO);
    }*/
  }

  actualizar() {
    const nuevoValor = this.fControl.value ? 1 : 0;
    if (this.data.valorNumero !== nuevoValor) {
      this.data.valorNumero = nuevoValor;
      /*
        if(chkBinario.selected){
					// chkBinario.label = obtenerValor(BINARIO_VERDADERO);
				}else{
					// chkBinario.label = obtenerValor(BINARIO_FALSO);
				}*/
      this.avisarModificacion();
    }
  }

  getXMLBase(): string {
    return '0-1';
  }
}
