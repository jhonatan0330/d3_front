import { Component, OnInit, ChangeDetectionStrategy, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { PedidoVentaDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { TemplateService } from 'app/modules/full/neuron/service/template.service';
import { UtilsService } from 'app/modules/full/neuron/service/utils.service';
import { ImageFormatPipe } from '../../../shared/local-image';

export enum TemplateEnum {
  TIPO_REPORTE = 'R',
  TIPO_PLANTILLA = 'P',
  TIPO_TABLERO = 'T'
}


@Component({
    selector: 'app-template',
    templateUrl: './template.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ImageFormatPipe]
})
export class TemplateComponent implements OnInit {
  private router = inject(Router);
  private utilsService = inject(UtilsService);
  private templateService = inject(TemplateService);

  readonly nombre = input('');
  readonly imagen = input('');
  readonly id = input<string>(undefined as any);
  readonly process_id = input<string>(undefined as any);
  readonly type = input<TemplateEnum>(undefined as any);
  readonly serverId = input<string>(undefined as any);

  ngOnInit(): void { }

  showTemplate() {
    const type = this.type();
    if (type === TemplateEnum.TIPO_REPORTE) {
      this.openDialog();
    } else {
      let newRoute = '';
      if (type === TemplateEnum.TIPO_TABLERO) {
        newRoute = '/process_crud/' + this.process_id();
      } else {
        newRoute = '/list/' + this.id();
        /*if (!this.id && this.process_id) {
          newRoute = '/process_crud/' + this.process_id;
        } else {
          newRoute = '/list/' + this.id;
        }*/
      }
      const serverId = this.serverId();
      if (serverId) { newRoute = newRoute + '/' + serverId }
      this.router.navigate(['/list' + newRoute]);
    }
  }

  openDialog() {
    const pedidoVenta: PedidoVentaDTO = new PedidoVentaDTO();
    pedidoVenta.plantilla = this.id();
    const serverId = this.serverId();
    if (serverId) {
      pedidoVenta.server = serverId
    }
    let _close2Save = false;
    if (this.type() === TemplateEnum.TIPO_REPORTE) {
      _close2Save = true;
    }
    this.utilsService.modalWithParams(pedidoVenta, _close2Save);
  }
}
