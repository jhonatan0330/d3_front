import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { BaseComponent } from '../base/base.component';
import { PlantillaHelper } from 'app/shared/plantilla-helper';

@Component({
  selector: 'app-binario',
  templateUrl: './binario.component.html'
})
export class BinarioComponent extends BaseComponent implements OnInit {
  fControl = new FormControl(false);
  labelTextBinary = '';

  constructor() {
    super();
  }

  ngOnInit() {
    super.ngOnInit();
    if (this.data) {
      if (!this.data.valorNumero) { this.data.valorNumero = 0 }
      if (this.data.valorNumero === 1) { this.fControl.setValue(true); }
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
    this.labelTextBinary = this.obtenerValor(PlantillaHelper.BINARIO_PREGUNTA);
    if(this.labelTextBinary) { this.labelTextBinary = this.structure.nombre + ' - ' +  this.labelTextBinary;}
    else {this.labelTextBinary = this.structure.nombre;}
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

      if (nuevoValor === 1) {
        this.data.valorText = this.obtenerValor(PlantillaHelper.BINARIO_VERDADERO);
      } else {
        this.data.valorText = this.obtenerValor(PlantillaHelper.BINARIO_VERDADERO);
      }
      if (!this.data.valorText) { this.data.valorText = nuevoValor.toString(); }
      this.avisarModificacion();
    }
  }

  getXMLBase(): string {
    return '0-1';
  }
}
