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

    this.form.get('tipoVia')?.valueChanges.subscribe((valor) => {
      this.actualizarOrientaciones(valor);
    });
  }

  orientaciones: string[] = ['Este', 'Sur'];
  orientaciones1: string[] = [];
  orientaciones2: string[] = [];

  actualizarOrientaciones(valor) {
    const tipoVia = valor;


    if (tipoVia == 'Calle' || tipoVia == 'Diagonal') {
      this.orientaciones1 = ['Sur'];
      this.orientaciones2 = ['Este'];
    } else if (tipoVia == 'Carrera' || tipoVia == 'Transversal') {
      this.orientaciones1 = ['Este'];
      this.orientaciones2 = ['Sur'];
    } else {
      // por defecto, sin opciones
      this.orientaciones1 = [...this.orientaciones];
      this.orientaciones2 = [...this.orientaciones];
    }
  }

  emitirDireccion() {
    const v = this.form.value;
    const direccion = `${v.tipoVia || ''} ${v.numPrincipal || ''}${v.letraPrincipal || ''} ${v.bis || ''} ${v.orientacion1 || ''} ${v.numSecundario || ''}${v.letraSecundaria || ''} ${v.bis2 || ''} ${v.orientacion2 || ''} ${v.numT || ''} ${v.complemento || ''}`
      .replace(/\s+/g, ' ')
      .trim();

    // Emitimos al padre
    this.direccionChange.emit(direccion);
  }
}
