import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {  PedidoVentaCaracteristicaFilterDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import { BaseComponent } from '../base/base.component';
import { BarcodeFormat } from '@zxing/library';
import Swal from 'sweetalert2';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { DireccionesComponent } from './direcciones/direcciones.component';
import { TitleCasePipe } from '@angular/common';

@Component({
    selector: 'app-texto',
    templateUrl: './texto.component.html',
    styleUrls: ['./texto.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatFormField, MatLabel, MatInput, FormsModule, ReactiveFormsModule, ZXingScannerModule, DireccionesComponent, TitleCasePipe]
})
export class TextoComponent extends BaseComponent implements OnInit {
  textoLargo = false;
  scannerEnabled = false;
  formatText = '';
  allowedFormats = [BarcodeFormat.QR_CODE, BarcodeFormat.EAN_13, BarcodeFormat.CODE_128, BarcodeFormat.DATA_MATRIX];
  readingQR = false;

  valorDefecto: string;

  fControl = new FormControl('');

  constructor() {
    super(); // super(base);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.valorDefecto = this.obtenerValor(PlantillaHelper.DEFAULT);
    this.formatText = this.obtenerValor(PlantillaHelper.FORMATO);
    this.textoLargo = !this.isEmpty(
      this.obtenerValor(PlantillaHelper.TEXTO_LARGO)
    );
    this.scannerEnabled = !this.isEmpty(this.obtenerValor(PlantillaHelper.READ_QR));
    if (this.data) {
      if (this.data.valorText) {
        this.fControl.setValue(this.data.valorText);
      } else {
        if (!this.data.llaveTabla && this.valorDefecto) { this.fControl.setValue(this.valorDefecto) };
      }
    }
    
    if (this.required) {
      this.fControl.setValidators(Validators.required);
      this.fControl.updateValueAndValidity();
    }
    /* if (this.isEnabled) {
      this.fControl.enable();
    } else {
      this.fControl.disable();
    }*/
    this.fControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      this.actualizar();
    });
    
  }

  actualizar(): void {
    const nuevoValor = this.fControl.value;
    if (this.data.valorText !== nuevoValor) {
      this.data.valorText = nuevoValor!;
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
            (!element.valorText) ? '' : element.valorText
          );
        }
      }
      this.fControl.setValue(textoCalculado);
      this.actualizar();
    }
  }

  onCodeResult(resultString: string) {
    if(this.readingQR) {return;}
    this.readingQR = true;
    const audio = new Audio();
    audio.src = 'assets/audio/beep.mp3';
    audio.load();
    audio.play();
    this.fControl.setValue(resultString + this.fControl.value);
    Swal.fire({
      position: 'center',
      icon: 'info',
      title: resultString,
      showConfirmButton: false,
      timer: 2000
    }).then(() => {
      this.readingQR = false;
    });

  }

  onDireccionChange(direccion: string) {
    this.fControl.setValue(direccion);
  }

  send2Server(): boolean {
    if (this.isLoading()) { return false; }
    
    this.errorMessage = null!;
    if (this.required && !this.data.valorText && !this.isInvisible){
      this.errorMessage = "En la plantilla " + this._structure.plantillaNombre 	+ " es obligatorio registrar el campo " + this._structure.nombre + ")";
    }

    if (this.errorMessage) {
      const input = document.getElementById(this.idField!) as HTMLInputElement;
      if (input) { input.focus();  }
      return false;
    }
    return true;
  }
}
