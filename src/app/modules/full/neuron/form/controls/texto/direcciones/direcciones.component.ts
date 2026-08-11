// address-form.component.ts
import { Component, OnInit, ChangeDetectionStrategy, inject, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-direccion-form',
    templateUrl: './direcciones.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormsModule, ReactiveFormsModule]
})
export class DireccionesComponent implements OnInit {
  private fb = inject(FormBuilder);

  form: FormGroup;

  readonly direccionInicial = input<string>('');
  readonly direccionChange = output<string>();

  constructor() {
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
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.emitirDireccion();
    });

    this.form.get('tipoVia')?.valueChanges.pipe(takeUntilDestroyed()).subscribe((valor) => {
      this.actualizarOrientaciones(valor);
    });

  }
  ngOnInit(): void {
    const direccionInicial = this.direccionInicial();
    if (direccionInicial) {
      const valores = this.descomponerDireccion(direccionInicial);
      this.form.patchValue(valores, { emitEvent: false });
    }
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

  descomponerDireccion(direccion: string) {
    if (!direccion) {
      return {
        tipoVia: '',
        numPrincipal: '',
        letraPrincipal: '',
        bis: '',
        orientacion1: '',
        numSecundario: '',
        letraSecundaria: '',
        bis2: '',
        orientacion2: '',
        numT: '',
        complemento: ''
      };
    }

    // 1) Normalizar texto
    let s = direccion.toUpperCase().trim().replace(/\s+/g, ' ');

    // 2) Reemplazar # por espacio
    s = s.replace('#', ' ');

    // 3) Separar complemento por coma
    let complemento = '';
    const commaIdx = s.indexOf(',');
    if (commaIdx >= 0) {
      complemento = s.slice(commaIdx + 1).trim();
      s = s.slice(0, commaIdx).trim();
    }

    // 4) Detectar tipo de vía
    const tipoMatch = s.match(/^(CL|CALLE|CR|CRA|CARRERA|AV|AVDA|AVENIDA|DIAGONAL|TRANSVERSAL|TRANSV|TRAV|AVCARRERA|AVCALLE|KILOMETRO|VEREDA)\b/i);
    let tipoVia = '';
    if (tipoMatch) {
      switch (tipoMatch[1].toUpperCase()) {
        case 'CL': case 'CALLE': tipoVia = 'Calle'; break;
        case 'CR': case 'CRA': case 'CARRERA': tipoVia = 'Carrera'; break;
        case 'AV': case 'AVDA': case 'AVENIDA': tipoVia = 'Avenida'; break;
        case 'DIAGONAL': tipoVia = 'Diagonal'; break;
        case 'TRANSVERSAL': case 'TRANSV': case 'TRAV': tipoVia = 'Transversal'; break;
        case 'AVCARRERA':  case 'AvCarrera': tipoVia = 'AvCarrera'; break;
        case 'AVCALLE':  case 'AvCalle': tipoVia = 'AvCalle'; break;
        case 'KILOMETRO':  case 'Kilometro': tipoVia = 'Kilómetro'; break;
        case 'VEREDA': case 'vereda': tipoVia = 'Vereda'; break;
      }
      s = s.slice(tipoMatch[0].length).trim();
    }

    // 5) Inicializar campos
    let numPrincipal = '', letraPrincipal = '', bis = '', orientacion1 = '';
    let numSecundario = '', letraSecundaria = '', bis2 = '', orientacion2 = '', numT = '';

    const orientaciones = ['NORTE', 'SUR', 'ESTE', 'OESTE'];
    const tokens = s.split(' ').filter(t => t);

    for (const t of tokens) {
      // Separar por guiones
      const parts = t.split('-');
      for (const p of parts) {
        // Patrón número + letra opcional
        const matchNL = p.match(/^(\d+)([A-Z])?$/i);
        if (matchNL) {
          const numero = matchNL[1];
          const letra = matchNL[2] || '';

          if (!numPrincipal) {
            numPrincipal = numero;
            letraPrincipal = letra;
          } else if (!numSecundario) {
            numSecundario = numero;
            letraSecundaria = letra;
          } else if (!numT) {
            numT = numero;
          } else {
            complemento = complemento ? `${complemento} ${p}` : p;
          }
        } else if (/^BIS$/i.test(p)) {
          if (!bis) bis = 'BIS';
          else if (!bis2) bis2 = 'BIS';
          else complemento = complemento ? `${complemento} ${p}` : p;
        } else if (orientaciones.includes(p)) {
          if (!orientacion1) orientacion1 = p;
          else if (!orientacion2) orientacion2 = p;
          else complemento = complemento ? `${complemento} ${p}` : p;
        } else {
          complemento = complemento ? `${complemento} ${p}` : p;
        }
      }
    }

    return {
      tipoVia,
      numPrincipal,
      letraPrincipal,
      bis,
      orientacion1,
      numSecundario,
      letraSecundaria,
      bis2,
      orientacion2,
      numT,
      complemento
    };
  }






}
