import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { PedidoVentaCaracteristicaFilterDTO, PedidoVentaDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { UtilsService } from 'app/modules/full/neuron/service/utils.service';
import { ApiService } from 'app/modules/full/neuron/service/api.service';
import { finalize } from 'rxjs';
import { TemplateService } from 'app/modules/full/neuron/service/template.service';

@Component({
  selector: 'app-vinculo',
  templateUrl: './vinculo.component.html'
})
export class VinculoComponent extends BaseComponent implements OnInit {

  proceso: PedidoVentaDTO; // Contiene el documento seleccionado

  constructor(
    private utilsService: UtilsService,
    private templateService: TemplateService,
    private api: ApiService
  ) {
    super();
  }

  ngOnInit() {
    super.ngOnInit();
    if (!this.data || !this.data.expedientes || this.data.expedientes.length === 0) { return; }
    this.proceso = this.data.expedientes[0];
    this.data.principal = this.proceso;
    if (this.proceso.dinero) {
      this.data.valorNumero = this.proceso.dinero.saldo;
    }
  }


  openDocument(p: PedidoVentaDTO) {
    const pedidoVenta: PedidoVentaDTO = new PedidoVentaDTO();
    pedidoVenta.plantilla = p.plantilla;
    pedidoVenta.llaveTabla = p.llaveTabla;
    pedidoVenta.server = this.urlServer;
    this.utilsService.modalWithParams(pedidoVenta, false);
  }


  getColor(pEstado: string) {
    return this.templateService.getColor(pEstado);
  }


  getColorFont(pEstado: string) {
    return this.templateService.getColorFont(pEstado);
  }
}
