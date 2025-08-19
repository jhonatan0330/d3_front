// address-form.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-direccion-form',
  templateUrl: './direcciones.component.html'
})
export class DireccionesComponent {
  form: FormGroup;

  @Output() direccionChange = new EventEmitter<string>();

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      tipoVia: [''],
      numPrincipal: [''],
      letraPrincipal: [''],
      bis: [''],
      orientacion1: [''],
      numSecundario: [''],
      letraSecundaria: [''],
      bis2: [''],
      orientacion2: [''],
      numT: [''],
      complemento: [''],
      direccionCompleta: [{ value: '', disabled: true }]
    });

    // Emitir cada vez que algo cambie
    this.form.valueChanges.subscribe(() => {
      this.emitirDireccion();
    });
  }

  emitirDireccion() {
    const v = this.form.value;
    const direccion = `${v.tipoVia || ''} ${v.numPrincipal || ''}${v.letraPrincipal || ''} ${v.bis || ''} ${v.orientacion1 || ''} # ${v.numSecundario || ''}${v.letraSecundaria || ''} ${v.bis2 || ''} ${v.orientacion2 || ''} - ${v.numT || ''} ${v.complemento || ''}`
      .replace(/\s+/g, ' ')
      .trim();

    // Emitimos al padre
    this.direccionChange.emit(direccion);
  }
}
