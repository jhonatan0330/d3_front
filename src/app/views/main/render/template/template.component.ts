import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PedidoVentaDTO } from 'app/model/sw42.domain';
import { UtilsService } from 'app/service/utils.service';

export enum TemplateEnum {
  TIPO_REPORTE = 'R',
  TIPO_PLANTILLA = 'P',
  TIPO_TABLERO = 'T'
}

@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.scss'],
})
export class TemplateComponent implements OnInit {
  @Input() nombre = '';
  @Input() imagen = '';
  @Input() id: string;
  @Input() process_id: string;
  @Input() type: TemplateEnum;
  @Input() serverId: string;

  constructor(private router: Router, private utilsService: UtilsService) {}

  ngOnInit(): void {}

  showTemplate() {
    if (this.type === TemplateEnum.TIPO_REPORTE) {
      this.openDialog();
    } else {
      let newRoute = '';
      if (this.type === TemplateEnum.TIPO_TABLERO) {
        newRoute = '/tablet/' + this.id;
      } else {
        if (!this.id && this.process_id) {
          newRoute = '/process_crud/' + this.process_id;
        } else {
          newRoute = '/list/' + this.id;
        }
      }
      if(this.serverId) { newRoute = newRoute + '/' + this.serverId }
      this.router.navigate(['/list' +newRoute]);
    }
  }

  openDialog() {
    const pedidoVenta: PedidoVentaDTO = new PedidoVentaDTO();
    pedidoVenta.plantilla = this.id;
    let _close2Save = false;
    if (this.type === TemplateEnum.TIPO_REPORTE) {
      _close2Save = true;
    }
    this.utilsService.modalWithParams(pedidoVenta, _close2Save);
  }
}
