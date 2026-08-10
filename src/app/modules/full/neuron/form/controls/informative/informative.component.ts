import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PedidoVentaCaracteristicaDTO, PedidoVentaCaracteristicaFilterDTO, PedidoVentaDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { BaseComponent } from '../base/base.component';
import { UtilsService } from '../../../service/utils.service';
import { ApiService } from '../../../service/api.service';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { TitleCasePipe } from '@angular/common';

@Component({
    selector: 'app-informative',
    templateUrl: './informative.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatFormField, MatLabel, MatInput, FormsModule, ReactiveFormsModule, TitleCasePipe]
})
export class InformativeComponent extends BaseComponent implements OnInit {
  private utilsService = inject(UtilsService);
  private api = inject(ApiService);


  fControl = new FormControl('');

  ngOnInit(): void {
    super.ngOnInit();
    if (this.data) {
      if (this.data.valorText) {
        this.fControl.setValue(this.data.valorText);
      } else{
        if(!this.data.principal){
          this.procesarCampo(null!);
        }
      }
    }
    this.fControl.valueChanges.subscribe((value) => {
      this.actualizar();
    });
  }

  actualizar(): void {
    const nuevoValor = this.fControl.value;
    if (this.data.valorText !== nuevoValor) {
      this.data.valorText = nuevoValor!;
      //Me estaba colocando los formularios como modificados pero no tenian valor
      if(nuevoValor) {this.avisarModificacion();}
    }
  }

  procesarCampo(campoFiltro: PedidoVentaCaracteristicaFilterDTO): void {
    if(!this.data.dependientes || this.data.dependientes.length===0) {return;}
    let filterVerification:string = null!;
    for (let i = 0; i < this.data.dependientes.length; i++) {
      const iDependent = this.data.dependientes[i];
      if(iDependent.valorOpcion) { filterVerification = iDependent.valorOpcion; }
    }
    if(!filterVerification) {return;}
    const filtro: PedidoVentaCaracteristicaFilterDTO =
    new PedidoVentaCaracteristicaFilterDTO();
    filtro.campoDTO = this.structure;
    filtro.campo = this.structure.llaveTabla;
    filtro.dependientes = this.data.dependientes;
    this.api
    .consultarDatosBase(filtro, this.urlServer)
    .subscribe((_value: PedidoVentaCaracteristicaFilterDTO) => {
      if(_value){
        this.data.valorAuxiliar = _value.valorAuxiliar;
        this.data.valorFecha = _value.valorFechaMin;
        this.data.valorNumero = _value.valorNumeroMin;
        this.data.valorOpcion = _value.valorOpcion;
        this.fControl.setValue(_value.valorText);
      } else {
        this.fControl.setValue(null);
      }
    });

  }

  openDialog(p: PedidoVentaDTO) {
    const pedidoVenta: PedidoVentaDTO = new PedidoVentaDTO();
    pedidoVenta.plantilla = p.plantilla;
    pedidoVenta.llaveTabla = p.llaveTabla;
    pedidoVenta.server = this.urlServer;
    this.utilsService.modalWithParams(pedidoVenta, false).subscribe({ error: () => {} });
  }
}
