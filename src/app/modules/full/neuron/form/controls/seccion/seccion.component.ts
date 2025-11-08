import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { PedidoVentaCaracteristicaDTO, PedidoVentaCaracteristicaFilterDTO } from '../../../model/sw42.domain';
import { ApiService } from '../../../service/api.service';
import { DocumentoPlantillaCaracteristicaEnum } from '../../../model/sw42.enum';
import { PlantillaHelper } from 'app/shared/plantilla-helper';

@Component({
  selector: 'app-seccion',
  templateUrl: './seccion.component.html'
})
export class SeccionComponent extends BaseComponent implements OnInit {
  
  constructor(private api: ApiService) {
    super();
  }

  ngOnInit(): void {
    if(this.data.documento){
      const campoFiltro: PedidoVentaCaracteristicaFilterDTO = new PedidoVentaCaracteristicaFilterDTO();
      campoFiltro.documento = this.data.documento;
       if (!this.isEmpty( this.obtenerValor(PlantillaHelper.SECCION_FUNCION))){
        this.isInvisible = true;
        this.form.reviewFieldsVisibility();
      } else {
        if (this.obtenerPropiedad(PlantillaHelper.INVISIBLE)) {
          this.isInvisible = true;
          this.form.reviewFieldsVisibility();
        }
      }
      this.procesarCampo(campoFiltro);
    }
  }

  procesarCampo(campoFiltro: PedidoVentaCaracteristicaFilterDTO) {
      if (!this.isEmpty( this.obtenerValor(PlantillaHelper.SECCION_FUNCION))) {
      if (campoFiltro) {
        const filtro: PedidoVentaCaracteristicaFilterDTO = new PedidoVentaCaracteristicaFilterDTO();
        if (this.relatedFields) {
            if ( !this.data.dependientes ||
            this.data.dependientes.length !== this.relatedFields.length
          ) {
            return;
          }
          for (let index = 0; index < this.data.dependientes.length; index++) {
            const pvc: PedidoVentaCaracteristicaDTO =
              this.data.dependientes[index];
            if (!pvc.valorOpcion) {
              if (!pvc.campoDTO ||
                pvc.campoDTO.formato === DocumentoPlantillaCaracteristicaEnum.PROCESO) {
                return;
              }
            }
          }
          filtro.dependientes = this.data.dependientes;
        } else {
          // Si no tiene dependencia debe tener id de documento como minimo
          if (!this.data.documento) {
            return;
          }
        }
        // Por dependientes siempre coloco el base ahora toca ver en donde me falla
        filtro.campoDTO = this.structure;
        filtro.campo = this.structure.llaveTabla;
        filtro.documento = campoFiltro.documento;
          this. isLoading = true;
        this.api.consultarDatosBase(filtro, this.urlServer).subscribe({
              next:(_value: PedidoVentaCaracteristicaFilterDTO) => {
                if(_value.valorNumeroMax && _value.valorNumeroMax === 1) {
              this.isInvisible = false;
            } else {
              this.isInvisible = true;
            }
                this.form.reviewFieldsVisibility();
            this.isLoading = false;
          },
              error:()=>{
            this.isLoading = false;
          }
        });
      }
    }
  }

  mostrarOcultar() {
    this.isSectionInvisible = !this.isSectionInvisible;
    this.form.reviewFieldsVisibility();
  }

}
