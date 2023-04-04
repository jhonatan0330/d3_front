import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PedidoVentaDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { TemplateService } from 'app/modules/full/neuron/service/template.service';
import { UtilsService } from 'app/modules/full/neuron/service/utils.service';

export enum TemplateEnum {
  TIPO_REPORTE = 'R',
  TIPO_PLANTILLA = 'P',
  TIPO_TABLERO = 'T'
}

@Component({
  selector: 'app-template',
  templateUrl: './template.component.html'
})
export class TemplateComponent implements OnInit {
  @Input() nombre = '';
  @Input() imagen = '';
  @Input() id: string;
  @Input() process_id: string;
  @Input() type: TemplateEnum;
  @Input() serverId: string;

  constructor(
    private router: Router, 
    private utilsService: UtilsService, private templateService: TemplateService) { }

  ngOnInit(): void { }

  showTemplate() {
    if (this.type === TemplateEnum.TIPO_REPORTE) {
      this.openDialog();
    } else {
      let newRoute = '';
      if (this.type === TemplateEnum.TIPO_TABLERO) {
        newRoute = '/process_crud/' + this.process_id;
      } else {
        newRoute = '/list/' + this.id;
        /*if (!this.id && this.process_id) {
          newRoute = '/process_crud/' + this.process_id;
        } else {
          newRoute = '/list/' + this.id;
        }*/
      }
      if (this.serverId) { newRoute = newRoute + '/' + this.serverId }
      this.router.navigate(['/list' + newRoute]);
    }
  }

  openDialog() {
    const pedidoVenta: PedidoVentaDTO = new PedidoVentaDTO();
    pedidoVenta.plantilla = this.id;
    if (this.serverId) {
      pedidoVenta.server = this.serverId
    }
    let _close2Save = false;
    if (this.type === TemplateEnum.TIPO_REPORTE) {
      _close2Save = true;
    }
    this.utilsService.modalWithParams(pedidoVenta, _close2Save);
  }
}
