import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { PedidoVentaCaracteristicaDTO, PedidoVentaCaracteristicaFilterDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import { BaseComponent } from '../base/base.component';
import { BarcodeFormat } from '@zxing/library';
import { timer } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-texto',
  templateUrl: './texto.component.html',
  styleUrls: ['./texto.component.scss'],
})
export class TextoComponent extends BaseComponent implements OnInit {
  textoLargo = false;
  scannerEnabled = false;
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
    // Al finalzar se subscriben los cambios
    this.fControl.valueChanges.subscribe((value) => {
      this.actualizar();
    });
    
  }

  actualizar(): void {
    const nuevoValor = this.fControl.value;
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
            (!element.valorText) ? '' : element.valorText
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
}
