import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DocumentoPlantillaCaracteristicaEnum } from 'app/model/sw42.enum';
import { PedidoVentaCaracteristicaFilterDTO } from 'app/model/sw42.filter';
import { ApiService } from 'app/service/api.service';
import { TemplateService } from 'app/service/template.service';
import { UtilsService } from 'app/service/utils.service';
import { PlantillaHelper } from 'app/shared/helpers/plantilla-helper';
import { BaseComponent } from '../base/base.component';
import { Estructura } from './estructura';

@Component({
  selector: 'app-disponibilidad',
  templateUrl: './disponibilidad.component.html'
})
export class DisponibilidadComponent extends BaseComponent implements OnInit {
  @ViewChild('canvas', { static: true }) myCanvas: ElementRef<HTMLCanvasElement>;
  ctx: CanvasRenderingContext2D;
  estructura: Estructura;
  multiple = false;

  fControl = new FormControl('');

  constructor(
    private api: ApiService,
    private template: TemplateService,
    private utils: UtilsService
  ) {
    super();
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.multiple = !this.isEmpty(this.obtenerValor(PlantillaHelper.MULTIPLE_SELECCION));
    this.ctx = this.myCanvas.nativeElement.getContext('2d');
    this.fControl.setValue(this.data.valorText);
  }

  mostrarPlano(): void {
    if (!this.estructura) {
      this.procesarCampo(this.transformPVCtoFilter(this.data));
      return;
    }
    this.estructura.draw();
  }

  procesarCampo(campoFiltro: PedidoVentaCaracteristicaFilterDTO) {
    if (this.relatedFields) {
      if (
        !this.data.dependientes ||
        this.data.dependientes.length !== this.relatedFields.length
      ) {
        return;
      }
      for (let i = 0; i < this.relatedFields.length; i++) {
        if (
          !this.data.dependientes[i].valorOpcion 
            && this.data.dependientes[i].campoDTO.formato === DocumentoPlantillaCaracteristicaEnum.PROCESO
            && !PlantillaHelper.buscarPropiedad(this.data.dependientes[i].campoDTO.propiedades, PlantillaHelper.PERMISO_CAMPO_OPCIONAL)
        ) {
          return;
        }
      }
      const filtro: PedidoVentaCaracteristicaFilterDTO = new PedidoVentaCaracteristicaFilterDTO();
      filtro.campoDTO = this.structure;
      filtro.campo = this.structure.llaveTabla;
      filtro.documento = campoFiltro.documento;
      filtro.dependientes = this.data.dependientes;

      this.isLoading = true;
      this.api.consultarDatosBase(filtro, this.urlServer).subscribe({
        next: (_value: PedidoVentaCaracteristicaFilterDTO) => {
          this.isLoading = false;
          this.consultaExitosaDatosBase(_value);
        },
        error: () => {
          this.isLoading = false;
        },
      });
    }
  }

  consultaExitosaDatosBase(pCampo: PedidoVentaCaracteristicaFilterDTO) {
    this.estructura = new Estructura(this.ctx, pCampo.campoDTO, this.multiple, this.template, this.utils);
    this.estructura.isEnabled = this.isEnabled;
    this.mostrarPlano();
    // Solo al crear la estructura selecciono campos de resto lo hace el componente
    this.estructura.selectFromText(this.data.valorText);
    this.estructura.navItem$.subscribe( () => {
      this.ajustarData();
    });
  }

  ajustarData() {
    this.data.expedientes = this.estructura.reload();
    this.data.valorNumero = this.estructura.cantidad;
    this.data.valorText = this.estructura.seleccionados;
    this.fControl.setValue(this.data.valorText);
    this.avisarModificacion();
  }
}
